import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import News from "./pages/News";
import Stories from "./pages/Stories";
import NewsDetail from "./pages/NewsDetail";
import StoryDetail from "./pages/StoryDetail";
import FundingDetail from "./pages/FundingDetail";
import FeatureYourStory from "./pages/FeatureYourStory";
import GuestPost from "./pages/GuestPost";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Collaborate from "./pages/Collaborate";
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "news", Component: News },
      { path: "news/:id", Component: NewsDetail },
      { path: "stories", Component: Stories },
      { path: "stories/:id", Component: StoryDetail },
      { path: "funding/:id", Component: FundingDetail },
      { path: "feature-your-story", Component: FeatureYourStory },
      { path: "guest-post", Component: GuestPost },
      { path: "about", Component: AboutUs },
      { path: "contact", Component: ContactUs },
      { path: "collaborate", Component: Collaborate },
      { path: "careers", Component: Careers },
      { path: "privacy", Component: Privacy },
      { path: "terms", Component: Terms },
    ],
  },
]);
