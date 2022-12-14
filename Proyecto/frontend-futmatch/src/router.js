import gql from "graphql-tag";
import { createRouter, createWebHistory } from "vue-router";
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import Home from "./components/Home.vue";
import Login from "./components/Login.vue";
import SignUp from "./components/SignUp.vue";
import Convocatorias from "./components/Convocatorias.vue";
import Perfil from "./components/Perfil.vue";

const routes = [
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignUp,
    meta: { requiresAuth: false },
  },
  {
    path: "/user/convocatorias",
    name: "Convocatorias",
    component: Convocatorias,
    meta: { requiresAuth: true },
  },
  {
    path: "/user/perfil",
    name: "Perfil",
    component: Perfil,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const apolloClient = new ApolloClient({
  link: createHttpLink({ uri: "https://futmatch-apigateway.herokuapp.com" }),
  cache: new InMemoryCache(),
});

async function isAuth() {
  if (
    localStorage.getItem("token_access") === null ||
    localStorage.getItem("token_refresh") === null
  ) {
    return false;
  }

  try {
    var result = await apolloClient.mutate({
      mutation: gql`
        mutation ($refresh: String!) {
          refreshToken(refresh: $refresh) {
            access
          }
        }
      `,
      variables: {
        refresh: localStorage.getItem("token_refresh"),
      },
    });

    localStorage.setItem("token_access", result.data.refreshToken.access);
    return true;
  } catch {
    localStorage.clear();
    alert("Su sesión expiró, por favor vuelva a iniciar sesión");
    return false;
  }
}

router.beforeEach(async (to, from) => {
  var is_auth = await isAuth();

  if (is_auth == to.meta.requiresAuth) return true;
  if (is_auth) return { name: "Convocatorias" };
  return { name: "Home" };
});

export default router;
