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
      src={toAbsoluteUrl("/media/avatars/300-1.png")}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserProfileHero
        name={auth?.user?.name}
        image={image}
        info={[
          { label: `${auth?.user?.tier}`, icon: "abstract-41" },
          { label: `${auth?.user?.role}`, icon: "geolocation" },
          { email: `${auth?.user?.email}`, icon: "sms" },
        ]}
      />

      <Container>
        <Content />
      </Container>
    </div>
  );
};

export default Courses;
