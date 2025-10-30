import React from "react";
import { Container } from "@/components";
import { useAuthContext } from "@/auth/useAuthContext";
import { UserProfileHero } from "@/partials/heros";
import { toAbsoluteUrl } from "@/utils";
import Content from "./Content";

const Courses = () => {
  const { auth } = useAuthContext();

  const image = (
    <img
      src={toAbsoluteUrl(auth?.user?.image)}
      className="rounded-full border-3 border-success size-[100px] shrink-0 object-cover object-top"
    />
  );

  return (
    <div className="min-h-screen">
      <UserProfileHero
        name={auth?.user?.first_name + " " + auth?.user?.last_name}
        image={image}
        info={[
          {
            label: `${auth?.user?.first_name} ${auth?.user?.last_name}`,
            icon: "abstract-41",
          },
          { label: `${auth?.user?.role}`, icon: "geolocation" },
          { email: `${auth?.user?.email}`, icon: "sms" },
        ]}
      />

      <div className="container-fluid">
        <Content />
      </div>
    </div>
  );
};

export default Courses;
