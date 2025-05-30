import React from 'react';
import { message, Modal } from 'antd';
import { fireEvent, waitFor, screen } from '@testing-library/dom';
import { cleanup, act } from '@testing-library/react';
import FormElement from '@/views/page/FormElement';
import { useNavigation } from '@/views/layout/Layout';
import API from '@aws-amplify/api';
import * as Yup from 'yup';
import { useApi } from '@/hooks/Api';
import { routeMessages } from '@/fields/route/fields';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;
const settings = {
  title: 'Nombre x',
  back: '/someroute',
  form: {
    className: 'user-form',
    layout: 'vertical',
    name: 'newRoute',
    initialValues: {},
    requiredMark: false,
  },
  messages: routeMessages,
  validationSchema: Yup.object().shape({
    email: Yup.string()
      .label('Correo electrónico')
      .email('El formato de correo no es válido'),
  }),
  source: {
    url: 'route',
    key: 'route',
  },
  fieldset: [
    {
      row: { gutter: [25, 0] },
      cols: [
        {
            col: { xl: 8, md: 8, sm: 8, xs: 8 },
            button: {
              onClick: () => {},
            },
            item: {
              label: 'fakeButton',
              content: 'fakeButton',
              type: 'button',
            },
        },
        {
            col: { xl: 8, md: 8, sm: 8, xs: 8, gutter: [10, 0] },
            input: {
              name: 'plate',
            },
            item: {
              label: 'Matrícula',
              name: 'plate',
              htmlFor: 'plate',
              type: 'switch',
            },
        },
        {
          col: { xl: 8, md: 8, sm: 8, xs: 8, gutter: [10, 0] },
          input: {
            name: 'email',
            type: 'email',
            id: 'email',
            placeholder: 'Ej. fernando.gomez@easytrack.mx',
          },
          item: {
            label: 'Correo electrónico',
            name: 'email',
            htmlFor: 'email',
            type: 'input',
            tooltip: 'El correo electrónico debe pertenecer al dominio "@easytrack.mx"',
          },
        },
        {
            col: { xl: 8, md: 8, sm: 8, xs: 8, gutter: [10, 0] },
            input: {
              name: 'imei',
              type: 'text',
              id: 'imei',
              placeholder: 'Ej. 2342342332',
            },
            item: {
              label: 'IMEI',
              name: 'imei',
              htmlFor: 'imei',
              type: 'select',
            },
        },
      ],
    },
  ],
};

const editionSettings = {
  ...settings,
  edition: true,
  id: 1,
  can: {
    delete: true,
  },
};

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
  window.document.body.innerHTML = '';
});

describe('FormElement', () => {
    test('Should display the title page', async () => {
        const { getByText } = render(<FormElement settings={settings} />);
        await waitFor(() => expect(getByText(settings.title)).toBeInTheDocument());
    });

    test('Should display the buttons correctly', async () => {
        const { getByText } = render(<FormElement settings={settings} />);

        const saveButton = getByText('Guardar').closest('button');
        expect(saveButton).toBeInTheDocument();

        const deleteButton = screen.queryAllByText('Eliminar');
        expect(deleteButton.length).toBe(0);
    });

    test('Should save the edition element', async () => {
        const successSpy = jest.spyOn(message, 'success');
        await act(async () => {
        const { getByText } = render(
          <FormElement
            settings={{
                    ...settings,
                    form: {
                    ...settings.form,
                    initialValues: {
                        email: 'david.reyes@easytrack.mx',
                    },
                    },
                }}
          />
        );
        APIMock.post.mockImplementation(
            jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ created: true })) }))
        );
        const saveButton = getByText('Guardar').closest('button');
        await waitFor(() => expect(saveButton).toBeInTheDocument());
        await waitFor(() => expect(saveButton).toBeEnabled());

        fireEvent.click(saveButton);

        await waitFor(() => expect(API.post).toBeCalled());
        await waitFor(() => expect(successSpy).toBeCalled());
    });
  });

    test('Should initialize correctly the edition element', async () => {
        const returnValue = {
            email: 'david.reyes@easytrack.mx',
        };

        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));

        await act(async () => {
            const { getByText } = render(<FormElement settings={editionSettings} />);
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() =>
                expect(get).toBeCalledWith(
                    [settings.source.key, editionSettings.id],
                    `${settings.source?.url}/${editionSettings.id}`,
                    {},
                    expect.objectContaining({
                        enabled: editionSettings.edition,
                    })
                )
            );

            const saveButton = getByText('Guardar').closest('button');
            const deleteButton = getByText('Eliminar').closest('button');

            await waitFor(() => expect(saveButton).toBeInTheDocument());
            await waitFor(() => expect(saveButton).toBeEnabled());
            await waitFor(() => expect(deleteButton).toBeInTheDocument());
            await waitFor(() => expect(deleteButton).toBeEnabled());

            for (const r of settings.fieldset) {
                for (const col of r.cols) {
                    const item = getByText(col.item.label);
                    await waitFor(() => expect(item).toBeInTheDocument());
                }
            }
        });
    });

    it('Should disabled the save button when something is wrong', async () => {
        const returnValue = {
            email: 'david.reyes@easytrack.mx',
        };

        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
        await act(async () => {
            const { getByText } = render(
              <FormElement
                settings={{
                        ...editionSettings,
                        validationSchema: Yup.object().shape({
                        email: Yup.string().matches(/^\s+$|^$/gi),
                        firstName: Yup.string().matches(/^\s+$|^$/gi),
                        lastName: Yup.string().matches(/^\s+$|^$/gi).required(),
                        }),
                    }}
              />
            );
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() =>
                expect(get).toBeCalledWith(
                    [settings.source.key, editionSettings.id],
                    `${settings.source?.url}/${editionSettings.id}`,
                    {},
                    expect.objectContaining({
                        enabled: editionSettings.edition,
                    })
                )
            );

            const saveButton = await waitFor(() => getByText('Guardar').closest('button'));

            await waitFor(() => expect(saveButton).toBeInTheDocument());
            await waitFor(() => expect(saveButton).toBeEnabled());
        });
    });

    test('Should save the edition element', async () => {
        const successSpy = jest.spyOn(message, 'success');
        const returnValue = {
            email: 'david.reyes@easytrack.mx',
        };

        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));

        await act(async () => {
            const { getByText } = render(<FormElement settings={editionSettings} />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() =>
                expect(get).toBeCalledWith(
                    [settings.source.key, editionSettings.id],
                    `${settings.source?.url}/${editionSettings.id}`,
                    {},
                    expect.objectContaining({
                        enabled: editionSettings.edition,
                    })
                )
            );

            APIMock.put.mockImplementation(
                jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ updated: true })) }))
            );

            const saveButton = await waitFor(() => getByText('Guardar').closest('button'));
            await waitFor(() => expect(saveButton).toBeInTheDocument());
            await waitFor(() => expect(saveButton).toBeEnabled());
            fireEvent.click(saveButton);

            await waitFor(() => expect(API.put).toBeCalled());
            await waitFor(() => expect(successSpy).toBeCalled());
        });
    });
    test('Should display an error when save', async () => {
        const returnValue = {
            email: 'david.reyes@easytrack.mx',
        };
        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));

        await act(async () => {
            const { getByText } = render(<FormElement settings={editionSettings} />);
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() =>
                expect(get).toBeCalledWith(
                    [settings.source.key, editionSettings.id],
                    `${settings.source?.url}/${editionSettings.id}`,
                    {},
                    expect.objectContaining({
                        enabled: editionSettings.edition,
                    })
                )
            );

            APIMock.put.mockImplementation(
                jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ updated: true })) }))
            );

            APIMock.put.mockRejectedValueOnce();
            const saveButton = await waitFor(() => getByText('Guardar').closest('button'));
            await waitFor(() => expect(saveButton).toBeInTheDocument());
            await waitFor(() => expect(saveButton).toBeEnabled());

            fireEvent.click(saveButton);
            await waitFor(() => expect(API.put).toBeCalled());
        });
    });

    test('Should delete the edition element', async () => {
        const successSpy = jest.spyOn(message, 'success');
        const confirmSpy = jest.spyOn(Modal, 'confirm');
        const returnValue = {
            email: 'david.reyes@easytrack.mx'
        };

        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
        await act(async () => {
            const { getByText } = render(<FormElement settings={editionSettings} />);
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() =>
                expect(get).toBeCalledWith(
                    [settings.source.key, editionSettings.id],
                    `${settings.source?.url}/${editionSettings.id}`,
                    {},
                    expect.objectContaining({
                        enabled: editionSettings.edition,
                    })
                )
            );
            APIMock.del.mockImplementation(
                jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ deleted: true })) }))
            );

            const deleteButton = await waitFor(() => getByText('Eliminar').closest('button'));
            await waitFor(() => expect(deleteButton).toBeInTheDocument());
            await waitFor(() => expect(deleteButton).toBeEnabled());
            fireEvent.click(deleteButton);

            await waitFor(() => expect(confirmSpy).toBeCalled());
            let accept;

            await waitFor(() => {
                accept = getByText('Aceptar').closest('button');
            });
            fireEvent.click(accept);

            await waitFor(() => expect(API.del).toBeCalled());
            await waitFor(() => expect(successSpy).toBeCalled());
        });
    });

    test('Should display an error when delete the edition element', async () => {
        const confirmSpy = jest.spyOn(Modal, 'confirm');
        const returnValue = {
            email: 'david.reyes@easytrack.mx',
        };

        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
        await act(async () => {
            const { getByText } = render(<FormElement settings={editionSettings} />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() =>
                expect(get).toBeCalledWith(
                    [settings.source.key, editionSettings.id],
                    `${settings.source?.url}/${editionSettings.id}`,
                    {},
                    expect.objectContaining({
                        enabled: editionSettings.edition,
                    })
                )
            );

            APIMock.del.mockImplementation(
                jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ deleted: true })) }))
            );
            APIMock.del.mockRejectedValueOnce();

            const deleteButton = await waitFor(() => getByText('Eliminar').closest('button'));
            await waitFor(() => expect(deleteButton).toBeInTheDocument());
            await waitFor(() => expect(deleteButton).toBeEnabled());
            fireEvent.click(deleteButton);

            await waitFor(() => expect(confirmSpy).toBeCalled());
            let accept;
            await waitFor(() => {
                accept = getByText('Aceptar').closest('button');
            });

            fireEvent.click(accept);
            await waitFor(() => expect(API.del).toBeCalled());
        });
    });

    test('Should display back button ', async () => {
        const back = jest.fn();

        useNavigation.mockImplementationOnce(() => ({
            back,
        }));

        const { getByTitle } = render(<FormElement settings={settings} />);

        const backButton = getByTitle('back-btn');
        await waitFor(() => expect(backButton).toBeInTheDocument());

        fireEvent.click(backButton);
        await waitFor(() => expect(back).toBeCalledTimes(1));
    });
});
