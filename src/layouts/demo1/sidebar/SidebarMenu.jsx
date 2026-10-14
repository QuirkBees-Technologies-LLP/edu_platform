import clsx from "clsx";
import { KeenIcon } from "@/components/keenicons";
import {
  Menu,
  MenuArrow,
  MenuBadge,
  MenuBullet,
  MenuHeading,
  MenuIcon,
  MenuItem,
  MenuLabel,
  MenuLink,
  MenuSub,
  MenuTitle,
} from "@/components/menu";
import { useMenus } from "@/providers";
import { Lightbulb, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
const SidebarMenu = () => {
  const linkPl = "ps-[10px]";
  const linkPr = "pe-[10px]";
  const linkPy = "py-[6px]";
  const itemsGap = "gap-0.5";
  const subLinkPy = "py-[8px]";
  const rightOffset = "me-[-10px]";
  const iconWidth = "w-[20px]";
  const iconSize = "text-lg";
  const accordionLinkPl = "ps-[10px]";
  const accordionLinkGap = [
    "gap-[10px]",
    "gap-[14px]",
    "gap-[5px]",
    "gap-[5px]",
    "gap-[5px]",
    "gap-[5px]",
  ];
  const accordionPl = [
    "ps-[32px]",
    "ps-[32px]",
    "ps-[32px]",
    "ps-[32px]",
    "ps-[32px]",
    "ps-[32px]",
  ];
  const accordionBorderLeft = [
    "before:start-[20px]",
    "before:start-[32px]",
    "before:start-[32px]",
    "before:start-[32px]",
    "before:start-[32px]",
  ];
  const buildMenu = (items) => {
    return items.map((item, index) => {
      if (item.heading) {
        return buildMenuHeading(item, index);
      } else if (item.disabled) {
        return buildMenuItemRootDisabled(item, index);
      } else {
        return buildMenuItemRoot(item, index);
      }
    });
  };
  const buildMenuItemRoot = (item, index) => {
    if (item.children) {
      return (
        <MenuItem
          key={index}
          {...(item.toggle && {
            toggle: item.toggle,
          })}
          {...(item.trigger && {
            trigger: item.trigger,
          })}
        >
          <MenuLink
            externalLink={item.externalLink}
            newTab={item.newTab}
            path={item.path}
            className={clsx(
              "relative flex items-center grow cursor-pointer border border-transparent transition-all duration-200",
              // Left Glowing Active Bar Indicator
              "menu-item-active:before:absolute menu-item-active:before:-left-2 menu-item-active:before:top-1/2 menu-item-active:before:-translate-y-1/2 menu-item-active:before:w-2.5 menu-item-active:before:h-8 menu-item-active:before:bg-[#8B5CF6] menu-item-active:before:rounded-r-md menu-item-active:before:shadow-[0_0_12px_#8B5CF6]",
              accordionLinkGap[0],
              linkPl,
              linkPr,
              linkPy
            )}
          >
            {/* Wrapper Box: Fixed 40x40px size so all icons stay perfectly aligned */}
            <div className="flex items-center justify-center w-[40px] h-[40px] min-w-[40px] shrink-0 rounded-[12px] transition-all border border-transparent menu-item-active:bg-[#1C1335] menu-item-active:!border-[#6D28D9]/40 menu-item-active:shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <MenuIcon className="!w-auto !h-auto flex items-center justify-center text-gray-400 menu-item-active:text-[#A78BFA]">
                {item.icon && item.icon}
              </MenuIcon>
            </div>

            <MenuTitle className="text-sm font-normal text-gray-400 menu-item-active:text-[#A78BFA] menu-item-active:font-medium">
              {item.title}
            </MenuTitle>
            {buildMenuArrow()}
          </MenuLink>

          <MenuSub
            externalLink={item.externalLink}
            newTab={item.newTab}
            path={item.path}
            className={clsx(
              "",
              itemsGap,
              accordionBorderLeft[0],
              accordionPl[0]
            )}
          >
            {buildMenuItemChildren(item.children, index, 1)}
          </MenuSub>
        </MenuItem>
      );
    } else {
      return (
        <MenuItem key={index}>
          <MenuLink
            externalLink={item.externalLink}
            newTab={item.newTab}
            path={item.path}
            className={clsx(
              "relative flex items-center grow cursor-pointer border border-transparent transition-all duration-200",
              // Left Glowing Active Bar Indicator
              "menu-item-active:before:absolute menu-item-active:before:-left-2 menu-item-active:before:top-1/2 menu-item-active:before:-translate-y-1/2 menu-item-active:before:w-2.5 menu-item-active:before:h-8 menu-item-active:before:bg-[#8B5CF6] menu-item-active:before:rounded-r-md menu-item-active:before:shadow-[0_0_12px_#8B5CF6]",
              accordionLinkGap[0],
              linkPy,
              linkPl,
              linkPr
            )}
          >
            {/* Wrapper Box: Fixed 40x40px size so all icons stay perfectly aligned */}
            <div className="flex items-center justify-center w-[40px] h-[40px] min-w-[40px] shrink-0 rounded-[12px] transition-all border border-transparent menu-item-active:bg-[#1C1335] menu-item-active:!border-[#6D28D9]/40 menu-item-active:shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <MenuIcon className="!w-auto !h-auto flex items-center justify-center text-gray-400 menu-item-active:text-[#A78BFA]">
                {item.icon && item.icon}
              </MenuIcon>
            </div>

            <MenuTitle className="text-sm font-normal text-gray-400 menu-item-active:text-[#A78BFA] menu-item-active:font-medium">
              {item.title}
            </MenuTitle>
          </MenuLink>
        </MenuItem>
      );
    }
  };
  const buildMenuItemRootDisabled = (item, index) => {
    return (
      <MenuItem key={index}>
        <MenuLabel
          className={clsx(
            "border border-transparent",
            accordionLinkGap[0],
            linkPy,
            linkPl,
            linkPr
          )}
        >
          <MenuIcon
            className={clsx(
              "items-start text-gray-500 dark:text-gray-400",
              iconWidth
            )}
          >
            {item.icon && item.icon}
          </MenuIcon>
          <MenuTitle className="text-sm font-medium text-gray-800">
            {item.title}
          </MenuTitle>

          {item.disabled && buildMenuSoon()}
        </MenuLabel>
      </MenuItem>
    );
  };
  const buildMenuItemChildren = (items, index, level = 0) => {
    return items.map((item, index) => {
      if (item.disabled) {
        return buildMenuItemChildDisabled(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };
  const buildMenuItemChild = (item, index, level = 0) => {
    if (item.children) {
      return (
        <MenuItem
          key={index}
          {...(item.toggle && {
            toggle: item.toggle,
          })}
          {...(item.trigger && {
            trigger: item.trigger,
          })}
          className={clsx(item.collapse && "flex-col-reverse")}
        >
          <MenuLink
            className={clsx(
              "border border-transparent grow cursor-pointer",
              accordionLinkGap[level],
              accordionLinkPl,
              linkPr,
              subLinkPy
            )}
          >
            {buildMenuBullet()}

            {item.collapse ? (
              <MenuTitle className="text-2sm font-normal text-gray-600 dark:text-gray-500">
                <span className="hidden menu-item-show:!flex">
                  {item.collapseTitle}
                </span>
                <span className="flex menu-item-show:hidden">
                  {item.expandTitle}
                </span>
              </MenuTitle>
            ) : (
              <MenuTitle className="text-2sm font-normal me-1 text-gray-800 menu-item-active:text-primary menu-item-active:font-medium menu-link-hover:!text-primary">
                {item.title}
              </MenuTitle>
            )}

            {buildMenuArrow()}
          </MenuLink>
          <MenuSub
            externalLink={item.externalLink}
            newTab={item.newTab}
            path={item.path}
            className={clsx(
              !item.collapse &&
              "relative before:absolute before:top-0 before:bottom-0 before:left-1 before:border-s before:border-gray-200",
              itemsGap,
              !item.collapse && accordionBorderLeft[level],
              !item.collapse && accordionPl[level],
              !item.collapse && "relative before:absolute"
            )}
          >
            {buildMenuItemChildren(
              item.children,
              index,
              item.collapse ? level : level + 1
            )}
          </MenuSub>
        </MenuItem>
      );
    } else {
      return (
        <MenuItem key={index}>
          <MenuLink
            externalLink={item.externalLink}
            newTab={item.newTab}
            path={item.path}
            className={clsx(
              "flex items-center grow border-0 bg-transparent transition-colors py-1.5 px-2",
              accordionLinkGap[level],
              accordionLinkPl,
              linkPr,
              subLinkPy
            )}
          >
            {buildMenuBullet()}
            <MenuTitle className="text-xs font-normal text-gray-400 menu-item-active:text-[#A78BFA] menu-item-active:font-medium hover:text-white transition-colors">
              {item.title}
            </MenuTitle>
          </MenuLink>
        </MenuItem>
      );
    }
  };
  const buildMenuItemChildDisabled = (item, index, level = 0) => {
    return (
      <MenuItem key={index}>
        <MenuLabel
          className={clsx(
            "border border-transparent items-center grow",
            accordionLinkGap[level],
            accordionLinkPl,
            linkPr,
            subLinkPy
          )}
        >
          {buildMenuBullet()}
          <MenuTitle className="text-2sm font-normal text-gray-800">
            {item.title}
          </MenuTitle>
          {item.disabled && buildMenuSoon()}
        </MenuLabel>
      </MenuItem>
    );
  };
  const buildMenuHeading = (item, index) => {
    return (
      <MenuItem key={index} className="pt-2.25 pb-px">
        <MenuHeading
          className={clsx(
            "uppercase text-2sm font-medium text-gray-500",
            linkPl,
            linkPr
          )}
        >
          {item.heading}
        </MenuHeading>
      </MenuItem>
    );
  };
  const buildMenuArrow = () => {
    return (
      <MenuArrow
        className={clsx(
          "text-gray-400 dark:text-gray-900 w-[20px] shrink-0 justify-end ms-1",
          rightOffset
        )}
      >
        <KeenIcon icon="plus" className="text-2xs menu-item-show:hidden" />
        <KeenIcon
          icon="minus"
          className="text-2xs hidden menu-item-show:inline-flex"
        />
      </MenuArrow>
    );
  };
  const buildMenuBullet = () => {
    return (
      <MenuBullet className="flex w-[6px] start-[3px] rtl:start-0 relative before:absolute before:top-0 before:size-[6px] before:rounded-full rtl:before:translate-x-1/2 before:-translate-y-1/2 menu-item-active:before:bg-dark-light dark:menu-item-active:before:bg-gray-900 menu-item-hover:before:bg-primary"></MenuBullet>
    );
  };
  const buildMenuSoon = () => {
    return (
      <MenuBadge className={rightOffset}>
        <span className="badge badge-xs">Soon</span>
      </MenuBadge>
    );
  };
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig("primary");
  return (
    <div className="flex flex-col justify-between h-full grow">
      {/* 1. Primary Menu Navigation */}
      <Menu
        highlight={true}
        multipleExpand={false}
        className={clsx("flex flex-col grow", itemsGap)}
      >
        {menuConfig && buildMenu(menuConfig)}
      </Menu>

      {/* 2. Client Bottom Section */}
      <div className="pt-4 mt-auto border-t border-gray-800/60 flex flex-col gap-3 px-3 pb-3">

        {/* Option 1: Download IQ Social */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-[40px] h-[40px] min-w-[40px] shrink-0 rounded-[12px] bg-[#141022] border border-gray-800/80 flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="1" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
              Download IQ Social
            </span>
            <div className="flex items-center gap-1.5">
              <a
                href="https://apple.com"
                target="_blank"
                rel="noreferrer"
                className="text-[9px] text-gray-400 hover:text-white transition-colors underline"
              >
                Download iOS
              </a>
              <span className="text-gray-600">•</span>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[9px] text-gray-400 hover:text-white transition-colors underline"
              >
                Android
              </a>
            </div>
          </div>
        </div>

        {/* Option 2: Our Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 group text-decoration-none"
        >
          <div className="w-[40px] h-[40px] min-w-[40px] shrink-0 rounded-[12px] bg-[#141022] border border-gray-800/80 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-purple-500/40 transition-all">
            <Instagram className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
            Our Instagram
          </span>
        </a>

        {/* Option 3: User Profile Section */}
        <Link
          to="/profile"
          className="flex items-center gap-3 group text-decoration-none pt-1"
        >
          <div className="relative w-[40px] h-[40px] min-w-[40px] shrink-0">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Test User"
              className="w-full h-full rounded-[12px] object-cover border border-purple-500/60 p-[1px]"
            />
          </div>
          <span className="text-xs font-medium text-gray-200 group-hover:text-purple-400 transition-colors">
            Test User
          </span>
        </Link>
      </div>
    </div>
  );
};
export { SidebarMenu };
