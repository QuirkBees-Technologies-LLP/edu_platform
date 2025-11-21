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
  setLanguages,
  setSelectedLanguage,
} from "../../../store/reducer/studentLanagugeSlice";
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
    "/iq-academy-educators",
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

  const allowedRoutes =
    role === "student"
      ? planRoutes.filter((r) => STUDENT_ALLOWED_ROUTES.includes(r))
      : planRoutes;

  const showLanguageSelector =
    role !== "student" || allowedRoutes.includes(location.pathname);

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
  const { data } = useGetLanguageQuery();

  useEffect(() => {
    if (data) {
      dispatch(setLanguages(data.data));
      // Set English as default language if no language is selected
      if (!selectedLanguage) {
        const englishLanguage = data.data.find(
          (lang) => lang.name === "English"
        );
        if (englishLanguage) {
          dispatch(setSelectedLanguage(englishLanguage.name));
        }
      }
    }
  }, [data, selectedLanguage, dispatch]);

  // Fallback: Set English as default if no language is selected and no API data
  useEffect(() => {
    if (!selectedLanguage && !data) {
      dispatch(setSelectedLanguage("English"));
    }
  }, [selectedLanguage, data, dispatch]);

  return (
    <>
      {" "}
      <div className="flex items-center gap-2 lg:gap-3.5">
        {/* <button onClick={handleOpen} className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary text-gray-500">
        <KeenIcon icon="magnifier" />
      </button> */}
        {/* <ModalSearch open={searchModalOpen} onOpenChange={handleClose} /> */}

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
            {/* <MenuToggle className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
          <KeenIcon icon="messages" />
        </MenuToggle> */}

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
            {/* <MenuToggle className="btn btn-icon btn-icon-lg size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
          <KeenIcon icon="element-11" />
        </MenuToggle> */}

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
                    offset: isRTL() ? [-70, 10] : [70, 10], // [skid, distance]
                  },
                },
              ],
            }}
          >
            {/* <MenuToggle className="btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-light hover:text-primary dropdown-open:bg-primary-light dropdown-open:text-primary text-gray-500">
          <KeenIcon icon="notification-status" />
        </MenuToggle> */}
            {DropdownNotifications({
              menuTtemRef: itemNotificationsRef,
            })}
          </MenuItem>
        </Menu>
        {showLanguageSelector && (
          <div className="relative sm:w-56 language_select">
            {/* <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white dark:bg-gray-100 text-gray-600 shadow-sm hover:border-gray-400 transition"
      >
        {selected}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <ul className="absolute mt-1 w-full bg-white dark:bg-gray-100 border border-gray-200 rounded-lg shadow-md z-10">
          {languages.map((lang, index) => (
            <li
              key={index}
              onClick={() => {
                setSelected(lang);
                setOpen(false);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-200  text-xs text-gray-700"
            >
              <span className='hidden sm:block'>
                {lang.name}
              </span>
              <span className='sm:hidden block'>
                {lang.flag}
              </span>
            </li>
          ))}
        </ul>
      )} */}
            <Select
              value={selectedLanguage}
              onValueChange={(value) => dispatch(setSelectedLanguage(value))}
              className={`form-control input input-md w-full`}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(languages) && languages.length > 0 ? (
                  languages?.map((item) => (
                    <SelectItem key={item._id} value={item.name}>
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
              <span class="badge badge-xs badge-primary badge-outline">
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
