import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, message } from 'antd';

interface EditGeofencesModalProps {
  visible: boolean;
  onClose: () => void;
  selectedItems: {
    id: number;
    name: string;
    shortName: string;
    sectionTime: number;
    // transitSectionTime: number;
  }[];
  onSave: (updatedItems: any[]) => void;
}

const EditGeofencesModal: React.FC<EditGeofencesModalProps> = ({
  visible,
  onClose,
  selectedItems,
  onSave,
}) => {
  const [form] = Form.useForm();

  // Agrega el console.log aquí para depurar los datos recibidos
//  console.log('Datos recibidos en EditGeofencesModal:', selectedItems);

  // Limpia los campos del formulario cada vez que el modal se abre
  useEffect(() => {
    if (visible) {
      const initialValues = {};
      selectedItems.forEach((item, index) => {
        initialValues[`shortName_${index}`] = item.shortName;
        initialValues[`sectionTime_${index}`] = item.sectionTime;
      });
      form.setFieldsValue(initialValues); // Establece los valores iniciales
    }
  }, [visible, selectedItems, form]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const updatedItems = selectedItems.map((item, index) => ({
          ...item,
          shortName: values[`shortName_${index}`],
          sectionTime: values[`sectionTime_${index}`],
          transitSectionTime: item.transitSectionTime || 0, // Asegúrate de incluir transitSectionTime
          id_geocerca: item.id, // Asegúrate de incluir id_geocerca
          Name: item.name, // Asegúrate de incluir Name
          ShortName: values[`shortName_${index}`], // Asegúrate de incluir ShortName
          SectionTime: values[`sectionTime_${index}`], // Asegúrate de incluir SectionTime
        }));
       // console.log('Datos enviados desde EditGeofencesModal:', updatedItems);
        onSave(updatedItems); // Envía los datos actualizados al componente padre
        onClose(); // Cierra el modal
      })
      .catch(() => {
        message.error('Por favor, completa todos los campos.');
      });
  };
  return (
    <Modal
      visible={visible}
      title="Editar Geocercas Seleccionadas"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Guardar
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {selectedItems.map((item, index) => (
          <div key={item.id}>
            <h4>{item.name}</h4>
            <Form.Item
              label="Nombre Corto"
              name={`shortName_${index}`}
              rules={[{ required: true, message: 'Este campo es obligatorio' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Tiempo en Sección"
              name={`sectionTime_${index}`}
              rules={[{ required: true, message: 'Este campo es obligatorio' }]}
            >
              <Input type="number" />
            </Form.Item>
          </div>
        ))}
      </Form>
    </Modal>
  );
};

export default EditGeofencesModal;