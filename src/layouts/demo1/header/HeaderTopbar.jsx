import { useEffect, useRef, useState } from "react";
import { KeenIcon } from "@/components/keenicons";
import { useLocation } from "react-router-dom";

import { toAbsoluteUrl } from "@/utils";
import { Menu, MenuItem, MenuToggle } from "@/components";
import { DropdownUser } from "@/partials/dropdowns/user";
import { DropdownNotifications } from "@/partials/dropdowns/notifications";
import { DropdownApps } from "@/partials/dropdowns/apps";
import { DropdownChat } from "@/partials/dropdowns/chat";
import { ModalSearch } from "@/partials/modals/search/ModalSearch";
import { useLanguage } from "@/i18n";
import { useAuthContext } from "../../../auth/useAuthContext";
import { ChevronDown } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  selectLanguages,
  selectSelectedLanguage,
  selectSelectedLanguagesAdmin,
  setLanguages,
  setSelectedLanguage,
  toggleLanguageAdmin,
} from "../../../store/reducer/studentLanagugeSlice";
import { MultiSelectLanguage } from "@/components/ui/MultiSelectLanguage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLanguageQuery } from "../../../store/api/client/clientLanguageApiSlice";

const HeaderTopbar = () => {
  const STUDENT_ALLOWED_ROUTES = [
    "/fast-start-training",
    "/iq-vault",
    "/iq-academy",
    "/master-class",
  ];

  const EDUCATOR_ALLOWED_ROUTES = [
    // "/educator/master-class", // Language filter hidden on Educator Masterclass page — educators see all languages by default
    "/educator/stream-schedule",
    "/educator/ended-stream-schedule",
    "/educator/live-session",
    "/educator/ended-live-sessions"
  ];

  const ADMIN_ALLOWED_ROUTES = [
    "/admin/courses",
    "/admin/stream-schedule",
    "/admin/educator-ended-schedule",
    "/admin/live-session",
    "/admin/ended-live-sessions",
    "/admin/stream-recording"
  ];

  const location = useLocation();
  const { isRTL } = useLanguage();
  const itemChatRef = useRef(null);
  const itemAppsRef = useRef(null);
  const itemUserRef = useRef(null);
  const { auth } = useAuthContext();

  const user = auth?.user;
  const role = user?.role;
  const planRoutes = user?.plan?.allowedSideBar || [];

  const showLanguageSelector = (() => {
    if (role === "student") {
      const allowedRoutes = planRoutes.filter((r) => STUDENT_ALLOWED_ROUTES.includes(r));
      return allowedRoutes.includes(location.pathname);
    }
    if (role === "educator") {
      return EDUCATOR_ALLOWED_ROUTES.includes(location.pathname);
    }
    // Admin, super_admin, marketer — whitelist
    if (role === "admin" || role === "super_admin" || role === "marketer") {
      return ADMIN_ALLOWED_ROUTES.includes(location.pathname);
    }
    return false;
  })();

  const profilePhoto = auth?.user?.image;
  const itemNotificationsRef = useRef(null);
  const handleShow = () => {
    window.dispatchEvent(new Event("resize"));
  };
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const handleOpen = () => setSearchModalOpen(true);
  const handleClose = () => {
    setSearchModalOpen(false);
  };
  const [selected, setSelected] = useState("ENG");
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const languages = useSelector(selectLanguages);
  const selectedLanguage = useSelector(selectSelectedLanguage);
  const selectedLanguagesAdmin = useSelector(selectSelectedLanguagesAdmin);
  const { data } = useGetLanguageQuery();

  useEffect(() => {
    if (data) {
      dispatch(setLanguages(data.data));
    }
  }, [data, dispatch]);

  return (
    <>
      {" "}
      <div className="flex items-center gap-2 lg:gap-3.5">
        <Menu>
          <MenuItem
            ref={itemChatRef}
            onShow={handleShow}
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? "bottom-start" : "bottom-end",
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: isRTL() ? [-170, 10] : [170, 10],
                  },
                },
              ],
            }}
          >

            {DropdownChat({
              menuTtemRef: itemChatRef,
            })}
          </MenuItem>
        </Menu>

        <Menu>
          <MenuItem
            ref={itemAppsRef}
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? "bottom-start" : "bottom-end",
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: isRTL() ? [-10, 10] : [10, 10],
                  },
                },
              ],
            }}
          >

            {DropdownApps()}
          </MenuItem>
        </Menu>

        <Menu>
          <MenuItem
            ref={itemNotificationsRef}
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? "bottom-start" : "bottom-end",
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: isRTL() ? [-70, 10] : [70, 10],
                  },
                },
              ],
            }}
          >
            {DropdownNotifications({
              menuTtemRef: itemNotificationsRef,
            })}
          </MenuItem>
        </Menu>
        {showLanguageSelector && (
          <div className="relative sm:w-56 language_select">
            {auth?.user?.role === "admin" || auth?.user?.role === "educator" || auth?.user?.role === "super_admin" || auth?.user?.role === "marketer" ? (
              <MultiSelectLanguage
                options={Array.isArray(languages) ? languages : []}
                selectedValues={selectedLanguagesAdmin || []}
                onToggle={(value) => dispatch(toggleLanguageAdmin(value))}
              />
            ) : (
              <Select
                value={selectedLanguage || ""}
                onValueChange={(value) => dispatch(setSelectedLanguage(value))}
              >
                <SelectTrigger className="w-full bg-light-light h-10 rounded-md border border-input px-3 py-2 text-[0.8125rem] font-medium hover:border-gray-400 focus:border-primary focus:ring-0 focus:ring-offset-0 focus:outline-none">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="max-h-64 z-[99999999]">
                  {data?.data?.length > 0 ? (
                    data?.data?.map((item) => (
                      <SelectItem key={item._id} value={item.name} className="cursor-pointer">
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No options available
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
        <Menu>
          <MenuItem
            ref={itemUserRef}
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? "bottom-start" : "bottom-end",
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: isRTL() ? [-20, 10] : [20, 10],
                  },
                },
              ],
            }}
          >
            <MenuToggle className="btn rounded-full ps-0">
              <span className="badge badge-xs badge-primary badge-outline">
                Premium
              </span>
              <img
                className="size-9 rounded-full border-2 border-success shrink-0 object-cover object-top"
                src={
                  profilePhoto?.includes("undefined")
                    ? toAbsoluteUrl("/media/avatars/300-2.png")
                    : profilePhoto
                }
                alt=""
              />
            </MenuToggle>
            {DropdownUser({
              menuItemRef: itemUserRef,
            })}
          </MenuItem>
        </Menu>
      </div>
    </>
  );
};
export { HeaderTopbar };
