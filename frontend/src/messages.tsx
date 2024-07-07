import {
  Datagrid,
  List,
  ReferenceField,
  TextField,
  DateField,
} from "react-admin";

export const MessageList = () => (
  <List>
    <Datagrid>
      <ReferenceField source="userId" reference="users" link="show" />
      <TextField source="message" />
      <DateField
        source="date"
        showTime
        locales="en-GB"
        options={{ hour12: false }}
      />
    </Datagrid>
  </List>
);
