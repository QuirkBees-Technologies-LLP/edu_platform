import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Fragment } from "react";
import { Container } from "@/components/container";
import clsx from "clsx";

const IdeasLayout = () => {
  const { pathname } = useLocation();

  const tabs = [
    { title: "Ideas", path: "/ideas" },
    { title: "Insights", path: "/iq-insight" },
    { title: "Live Ideas", path: "/live-ideas" },
  ];

  return (
    <Fragment>
      <Container>
        <div className="flex flex-wrap gap-5 justify-between items-center mb-5 lg:mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-medium leading-none text-gray-900">
              Ideas & Insights
            </h1>
            <div className="flex items-center gap-2 text-sm font-normal text-gray-700">
              Explore market ideas, insights, and live trading ideas.
            </div>
          </div>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-5 lg:gap-7 border-b border-gray-200 dark:border-gray-800 mb-5 lg:mb-10">
          {tabs.map((tab, index) => (
            <NavLink
              key={index}
              to={tab.path}
              className={({ isActive }) =>
                clsx(
                  "text-sm font-medium text-gray-700 hover:text-primary py-4 border-b-2",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent",
                )
              }
            >
              {tab.title}
            </NavLink>
          ))}
        </div>

        <Outlet />
      </Container>
    </Fragment>
  );
};

export { IdeasLayout };
