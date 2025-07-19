import SignInSide from "components/login/SignInSlide";
import Dashboard from "./views/Dashboard";
import LicensorDetails from "./views/LicensorDetails";
import Payments from "./views/Payments";
import SmartLicense from "./views/SmartLicense";
import BuildSmartLicense from "./views/BuildSmartLicense";
import Devices from "./views/Devices";
import IPRegistry from "./views/IPRegistry";
import ActiveLicenses from "views/ActiveLicenses";

var routes = [
  {
    path: "",
    name: "Login",
    icon: "nc-icon nc-bank",
    component: SignInSide,
    layout: "/login",
  },
  {
    path: "/dashboard",
    name: "Overview",
    icon: "nc-icon nc-bank",
    component: Dashboard,
    layout: "/licensee",
  },

  {
    path: "/payments",
    name: "Payments",
    icon: "nc-icon nc-money-coins",
    component: Payments,
    layout: "/licensee",
  },
  {
    path: "/licenses",
    name: "Active Licenses",
    icon: "nc-icon nc-vector",
    component: ActiveLicenses,
    layout: "/licensee",
  },
  {
    path: "/devices",
    name: "Devices",
    icon: "nc-icon nc-tile-56",
    component: Devices,
    layout: "/licensee",
  },

  {
    path: "/build-smart-license",
    name: "Build Smart License",
    icon: "nc-icon nc-settings-gear-65",
    component: BuildSmartLicense,
    layout: "/licensee",
  },

  {
    path: "/ip",
    name: "IP Registry",
    icon: "nc-icon nc-vector",
    component: IPRegistry,
    layout: "/licensee",
  },

  {
    path: "/licensor-det",
    name: "Licensors Details",
    icon: "nc-icon nc-single-02",
    component: LicensorDetails,
    layout: "/licensee",
  },
  {
    path: "/smart-license",
    name: "Smart License",
    icon: "nc-icon nc-layout-11",
    component: SmartLicense,
    layout: "/licensee",
  },
];
export default routes;
