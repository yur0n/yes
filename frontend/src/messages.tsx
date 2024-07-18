import {
  Datagrid,
  List,
  ReferenceField,
  TextField,
  DateField,
} from "react-admin";

export const MessageList = () => (
  <List>
    <Datagrid rowSx={(record) => ({
                backgroundColor: record.user
                  ? "rgba(64, 142, 198, 0.5)"
                  : "rgba(122, 32, 73, 0.5)"
              })}>
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
