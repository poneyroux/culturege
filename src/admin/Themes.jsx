import React from "react";
import {
  List,
  Datagrid,
  TextField,
  ColorField,
  ImageField,
  Edit,
  SimpleForm,
  TextInput,
  ColorInput,
  FileInput,
  FileField,
  Create,
  required,
  ArrayInput,
  SimpleFormIterator,
} from "react-admin";

export const ThemeList = () => (
  <List title="Thèmes">
    <Datagrid rowClick="edit">
      <ImageField source="image_url" label="Image" />
      <TextField source="name" label="Nom" />
      <TextField source="emoji" label="Emoji" />
      <ColorField source="color" label="Couleur" />
      <TextField source="subcategories" label="Catégories" />
    </Datagrid>
  </List>
);

export const ThemeEdit = () => (
  <Edit title="Modifier le thème">
    <SimpleForm>
      <TextInput
        source="name"
        label="Nom du thème"
        validate={required()}
        fullWidth
      />
      <TextInput source="slug" label="Slug URL" fullWidth />
      <TextInput source="emoji" label="Emoji" />
      <ColorInput source="color" label="Couleur du thème" />
      <TextInput source="image_url" label="URL de l'image" fullWidth />

      <ArrayInput source="subcategories" label="Sous-catégories">
        <SimpleFormIterator>
          <TextInput label="Nom de la catégorie" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export const ThemeCreate = () => (
  <Create title="Nouveau thème">
    <SimpleForm>
      <TextInput
        source="name"
        label="Nom du thème"
        validate={required()}
        fullWidth
      />
      <TextInput
        source="slug"
        label="Slug URL"
        fullWidth
        helperText="URL conviviale (ex: les-animaux-et-nous)"
      />
      <TextInput source="emoji" label="Emoji" />
      <ColorInput
        source="color"
        label="Couleur du thème"
        defaultValue="#000000"
      />
      <TextInput source="image_url" label="URL de l'image" fullWidth />

      <ArrayInput source="subcategories" label="Sous-catégories">
        <SimpleFormIterator>
          <TextInput label="Nom de la catégorie" />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);
