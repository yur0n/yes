import {
  Pagination,
  SimpleList,
  TextField,
  Show,
  ReferenceManyField,
  TabbedShowLayout,
  useRefresh,
} from "react-admin";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import SendMessage from "./components/sendMessageChat";

export default function UserShow() {
  const refresh = useRefresh();
  const params = useParams();
  const path = params["*"];
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (path !== "summary") {
      timer = setInterval(() => {
        refresh();
      }, 5000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [refresh, path]);

  return (
    <Show>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label='custom.fields.chat'>
          <ReferenceManyField
            pagination={<Pagination />}
            sort={{ field: "date", order: "DESC" }}
            perPage={10}
            reference="messages"
            target="userId"
          >
            <SimpleList
              rowSx={(record) => ({
                backgroundColor: record.user
                  ? "rgba(64, 142, 198, 0.5)"
                  : "rgba(122, 32, 73, 0.5)",
                borderRadius: "15px",
                padding: "0px",
                paddingLeft: "15px",
                paddingRight: "15px",
                margin: "1px",
              })}
              leftAvatar={(record) => (record.user ? "U" : "A")}
              primaryText={(record) => record.message}
              secondaryText={(record) => (record.user ? "User" : "Admin")}
              tertiaryText={(record) =>
                new Date(record.date).toLocaleString("en-GB", { hour12: false })
              }
            />
            <SendMessage />
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label='custom.fields.summary' path="summary">
          <TextField source="phone" />
          <TextField source="telegram" />
          <TextField source="name" />
          <TextField source="username" />
          <TextField source="note" />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}
