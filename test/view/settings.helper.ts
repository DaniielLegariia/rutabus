
export const settings = {
    title: 'Vehículos',
    extras: [
        {
            link: '', 
            text: 'Agregar', 
            button: { 
                onClick: jest.fn(),
                type: 'primary',
                danger: true,
                shape: 'round',
            },
            key: 'add',
        },
    ],
    source: {
        url: 'vehicle',
        key: 'vehicle',
        id: 'Name',
        extraParams: {
            // limit: 3,
            routeStatus: "",
            dateTime: "",
            pagination: undefined,
        },
        options: {
            retry: false,
            refetchOnWindowFocus: false
        },
    },
    table: { 
        pagination: false,
        scroll: { y: "50vh" },
        bordered: true,
        showSorterTooltip: false,
        onSaveEditCell: jest.fn(),
        refetchData: jest.fn(),
        columns: [ 
            {
                title: 'Nombre en plataforma',
                dataIndex: 'Name',
                search: false,
            },
            {
                title: 'Nombre corto',
                dataIndex: 'ShortName',
                search: false,
                editable: true,
            },
        ],
    },
};
