import express from "express";
import userRoute from "./users.route";

const router = express.Router();

// Default App Routes
const defaultRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
