import { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useAuthContext } from "@/auth";
import { useLanguage } from "@/i18n";
import { toAbsoluteUrl } from "@/utils";
import { DropdownUserLanguages } from "./DropdownUserLanguages";
import { useSettings } from "@/providers/SettingsProvider";
import { KeenIcon } from "@/components";
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuIcon,
} from "@/components/menu";
import { useDispatch } from "react-redux";

const DropdownUser = ({ menuItemRef }) => {
  const { settings, storeSettings } = useSettings();
  const { logout, auth, saveAuth } = useAuthContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const isGuideActive = auth?.user?.role === 'student' && !auth?.user?.hasSeenTour;

  const handleUserGuideToggle = () => {
    if (auth?.user) {
      const isActivating = !isGuideActive;

      if (isActivating) {
        saveAuth({
          ...auth,
          user: { ...auth.user, hasSeenTour: false },
        });
        navigate("/dashboard");
      } else {
        saveAuth({
          ...auth,
          user: { ...auth.user, hasSeenTour: true },
        });
      }
      if (menuItemRef && menuItemRef.current) {
        menuItemRef.current.hide();
      }
    }
  };

  const handleThemeMode = () => {
    const newThemeMode = settings.themeMode === "dark" ? "light" : "dark";
    storeSettings({ themeMode: newThemeMode });
  };

  const userEmail = auth?.user?.email;
  const profilePhoto =
    auth?.user?.image?.includes("undefined") || !auth?.user?.image
      ? toAbsoluteUrl("/media/avatars/300-2.png")
      : auth?.user?.image;

  const buildHeader = () => (
    <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
      <div className="flex items-center gap-2">
        <img
          className="size-9 rounded-full border-2 border-success flex-shrink-0 object-cover object-top"
          src={profilePhoto}
          alt="User Avatar"
        />
        <div className="flex flex-col">
          <Link
            to="#"
            className="text-sm text-gray-800 dark:text-gray-800 hover:text-primary font-semibold leading-none"
          >
            {auth?.user?.first_name} {auth?.user?.last_name}
          </Link>
          <a
            href={`mailto:${userEmail}`}
            className="block w-24 md:w-40 line-clamp-1 truncate text-xs text-gray-600 dark:text-gray-500 hover:text-primary font-medium leading-none"
            title={userEmail}
          >
            {userEmail}
          </a>
        </div>
      </div>
    </div>
  );

  const buildMenu = () => {
    const roleBasedProfilePaths = {
      user: "/profile",
      admin: "/admin/profile",
      educator: "/educator/profile",
    };

    const profilePath = roleBasedProfilePaths[auth?.user?.role] || "/profile";

    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          {/* <MenuItem>
          <MenuLink path="/public-profile/profiles/default">
            <MenuIcon className="menu-icon">
              <KeenIcon icon="badge" />
            </MenuIcon>
            <MenuTitle>
              <FormattedMessage id="USER.MENU.PUBLIC_PROFILE" />
            </MenuTitle>
          </MenuLink>
        </MenuItem> */}
          {(auth?.user?.role === 'student' || auth?.user?.role === 'user') && (
            <MenuItem>
              <MenuLink path="/profile?tab=notifications">
                <MenuIcon>
                  <KeenIcon icon="shield-tick" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.NOTIFICATIONS" defaultMessage="Notifications" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
          )}
          <MenuItem>
            <MenuLink path={profilePath}>
              <MenuIcon>
                <KeenIcon icon="profile-circle" />
              </MenuIcon>
              <MenuTitle>
                <FormattedMessage id="USER.MENU.MY_PROFILE" />
              </MenuTitle>
            </MenuLink>
          </MenuItem>
          {/* {auth?.user?.role === 'educator' && (
            <MenuItem>
              <MenuLink path="/educator/tv-webhook">
                <MenuIcon>
                  <KeenIcon icon="chart-line-up" />
                </MenuIcon>
                <MenuTitle>TradingView Webhook</MenuTitle>
              </MenuLink>
            </MenuItem>
          )} */}
          {(auth?.user?.role === 'student' || auth?.user?.role === 'user') && (
            <div className="menu-item mb-0.5">
              <div
                className="menu-link cursor-pointer select-none"
                onClick={handleUserGuideToggle}
              >
                <span className="menu-icon">
                  <KeenIcon icon="information" />
                </span>
                <span className="menu-title">
                  User Guide
                </span>
                <label className="switch switch-sm pointer-events-none">
                  <input name="userGuide" type="checkbox" checked={!!isGuideActive} readOnly />
                </label>
              </div>
            </div>
          )}
          <DropdownUserLanguages menuItemRef={menuItemRef} />
          <MenuSeparator />
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    const isDark = settings.themeMode === "dark";
    return (
      <div className="flex flex-col">
        <div className="menu-item mb-0.5">
          <div
            className="menu-link cursor-pointer select-none"
            onClick={handleThemeMode}
          >
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title">
              <FormattedMessage id="USER.MENU.DARK_MODE" />
            </span>
            <label className="switch switch-sm pointer-events-none">
              <input name="theme" type="checkbox" checked={isDark} readOnly />
            </label>
          </div>
        </div>

        <div className="menu-item px-4 py-1.5">
          <button
            onClick={() => logout(dispatch)}
            className="btn btn-sm btn-light justify-center w-full"
          >
            <FormattedMessage id="USER.MENU.LOGOUT" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
