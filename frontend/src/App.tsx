import { Admin, Resource, houseLightTheme, houseDarkTheme } from "react-admin";
import { UserList, UserEdit } from "./users";
import UserShow from "./userShow";
import { MessageList } from "./messages";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { i18nProvider } from './i18nProvider';

export const App = () => (
  <Admin 
    dataProvider={dataProvider} 
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    theme={houseLightTheme}
    darkTheme={houseDarkTheme}
  >
    <Resource
      name="users"
      list={UserList}
      show={UserShow}
      edit={UserEdit}
      recordRepresentation="name"
    />
    <Resource
      name="messages"
      list={MessageList}
      recordRepresentation="content"
    />
    {/* <Resource name="messages" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
    <Resource name="users" list={ListGuesser} edit={EditGuesser} show={ShowGuesser} /> */}
  </Admin>
);
