import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  Create,
  ReferenceInput,
  JsonInput,
} from "react-admin";
import ArticleContentEditor from "./ArticleContentEditor";

export const ArticleList = () => (
  <List title="Articles">
    <Datagrid rowClick="edit">
      <TextField source="title" label="Titre" />
      <ReferenceField source="theme_id" reference="themes" label="Thème">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="status" label="Statut" />
      <DateField source="created_at" label="Créé le" />
    </Datagrid>
  </List>
);

export const ArticleEdit = () => (
  <Edit title="Modifier l'article">
    <SimpleForm>
      <TextInput source="title" label="Titre" validate={required()} fullWidth />
      <TextInput
        source="slug"
        label="Slug URL"
        fullWidth
        helperText="URL de l'article"
      />
      <TextInput source="summary" label="Résumé" multiline rows={3} fullWidth />
      <ReferenceInput source="theme_id" reference="themes" label="Thème">
        <SelectInput optionText="name" validate={required()} />
      </ReferenceInput>
      <TextInput source="subcategory" label="Catégorie" />
      <TextInput source="image_url" label="URL de l'image" fullWidth />
      <SelectInput
        source="status"
        choices={[
          { id: "draft", name: "Brouillon" },
          { id: "published", name: "Publié" },
        ]}
        label="Statut"
      />
      <ArticleContentEditor source="content" label="Contenu de l'article" />
      <TextInput source="powerpoint_url" label="Lien PowerPoint" fullWidth />
    </SimpleForm>
  </Edit>
);

export const ArticleCreate = () => (
  <Create title="Nouvel article">
    <SimpleForm>
      <TextInput source="title" label="Titre" validate={required()} fullWidth />
      <TextInput
        source="slug"
        label="Slug URL"
        fullWidth
        helperText="URL de l'article (sera générée automatiquement si vide)"
      />
      <TextInput source="summary" label="Résumé" multiline rows={3} fullWidth />
      <ReferenceInput source="theme_id" reference="themes" label="Thème">
        <SelectInput optionText="name" validate={required()} />
      </ReferenceInput>
      <TextInput source="subcategory" label="Catégorie" />
      <TextInput source="image_url" label="URL de l'image" fullWidth />
      <SelectInput
        source="status"
        choices={[
          { id: "draft", name: "Brouillon" },
          { id: "published", name: "Publié" },
        ]}
        defaultValue="draft"
        label="Statut"
      />
      <ArticleContentEditor source="content" label="Contenu de l'article" />
      <TextInput source="powerpoint_url" label="Lien PowerPoint" fullWidth />
    </SimpleForm>
  </Create>
);
