import {
  Datagrid,
  List,
  ReferenceField,
  TextField,
  ReferenceManyCount,
  EditButton,
  Edit,
  SimpleForm,
  TextInput,
  BulkDeleteButton,
  TopToolbar,
} from "react-admin";
import SendMessageDialog from "./components/sendMessageButton";
import BulkSendMessageButton from "./components/bulkSendMessageButton";

const UserListActionButtons = () => (
  <>
    <BulkSendMessageButton />
    <BulkDeleteButton />
  </>
);

const ListActions = () => (
  <TopToolbar>
      <SendAllMessageButton />
  </TopToolbar>
);

export const UserList = () => (
  <List actions={<ListActions/>}>
    <Datagrid bulkActionButtons={<UserListActionButtons />}>
      <ReferenceField source="id" reference="users" link="show">
        <TextField source="phone" />
      </ReferenceField>
      <TextField source="telegram" />
      <TextField source="name" />
      <TextField source="username" />
      <ReferenceManyCount
        reference="messages"
        target="userId"
      />
      <TextField source="note" />
      <SendMessageDialog />
      <EditButton />
    </Datagrid>
  </List>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="phone" />
      <TextInput source="telegram" />
      <TextInput source="name" />
      <TextInput source="username" />
      <TextInput source="note" sx={{ width: "50%" }} />
    </SimpleForm>
  </Edit>
);
