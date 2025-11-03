import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useAuthContext } from '@/auth';
import { useLanguage } from '@/i18n';
import { toAbsoluteUrl } from '@/utils';
import { DropdownUserLanguages } from './DropdownUserLanguages';
import { useSettings } from '@/providers/SettingsProvider';
import { DefaultTooltip, KeenIcon } from '@/components';
import { MenuItem, MenuLink, MenuSub, MenuTitle, MenuSeparator, MenuArrow, MenuIcon } from '@/components/menu';
import { useDispatch } from 'react-redux';
const DropdownUser = ({
  menuItemRef
}) => {
  const {
    settings,
    storeSettings
  } = useSettings();
  const {
    logout
  } = useAuthContext();
  const dispatch = useDispatch();
  const {
    isRTL
  } = useLanguage();
  const handleThemeMode = event => {
    const newThemeMode = event.target.checked ? 'dark' : 'light';
    storeSettings({
      themeMode: newThemeMode
    });
  };
  const { auth } = useAuthContext();

  const userEmail = auth?.user?.email;
  const profilePhoto = auth?.user?.image;

  const buildHeader = () => {
    return <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
      <div className="flex items-center gap-2">
        <img className="size-9 rounded-full border-2 border-success flex-shrink-0 object-cover object-top" src={profilePhoto?.includes("undefined") ? toAbsoluteUrl('/media/avatars/300-2.png') : profilePhoto} alt="" />
        <div className="flex flex-col">
          <Link to="#" className="text-sm text-gray-800 hover:text-primary font-semibold leading-none">
          {auth?.user.first_name}{" "}{auth?.user.last_name} 
          </Link> 
          <a
            href={`mailto:${userEmail}`}
            className="block w-24 md:w-40 line-clamp-1 truncate text-xs text-gray-600 hover:text-primary font-medium leading-none"
            title={userEmail}
          >
            {userEmail}
          </a>

        </div>
      </div>
      {/* <span className="badge badge-xs badge-primary badge-outline">Pro</span> */}
    </div>;
  };
  const buildMenu = () => {
    const roleBasedProfilePaths = {
      user: '/profile',
      admin: '/admin/profile',
      educator: '/educator/profile',
    };

    const profilePath = roleBasedProfilePaths[auth.user.role] || '/profile';

    return <Fragment>
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
        {/* <MenuItem>
          <MenuLink path="/educator-details">
            <MenuIcon>
              <KeenIcon icon="profile-circle" />
            </MenuIcon>
            <MenuTitle>
              <FormattedMessage id="USER.MENU.EDUCATOR_DETAIL" />
            </MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem toggle="dropdown" trigger="hover" dropdownProps={{
          placement: isRTL() ? 'left-start' : 'right-start',
          modifiers: [{
            name: 'offset',
            options: {
              offset: isRTL() ? [50, 0] : [-50, 0] // [skid, distance]
            }
          }]
        }}>
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="setting-2" />
            </MenuIcon>
            <MenuTitle>
              <FormattedMessage id="USER.MENU.MY_ACCOUNT" />
            </MenuTitle>
            <MenuArrow>
              <KeenIcon icon="right" className="text-3xs rtl:transform rtl:rotate-180" />
            </MenuArrow>
          </MenuLink>
          <MenuSub className="menu-default light:border-gray-300 w-[200px]] md:w-[220px]">
            <MenuItem>
              <MenuLink path="/account/home/get-started">
                <MenuIcon>
                  <KeenIcon icon="coffee" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.GET_STARTED" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/account/home/user-profile">
                <MenuIcon>
                  <KeenIcon icon="some-files" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.MY_PROFILE" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/account/billing/basic">
                <MenuIcon>
                  <KeenIcon icon="icon" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.BILLING" />
                </MenuTitle>
                <DefaultTooltip title={<FormattedMessage id="USER.MENU.PAYMENT_&_SUBSCRIPTION_INFO" />} placement="top" className="max-w-48">
                  <KeenIcon icon="information-2" className="text-gray-500 text-md" />
                </DefaultTooltip>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/account/security/overview">
                <MenuIcon>
                  <KeenIcon icon="medal-star" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.SECURITY" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/account/members/teams">
                <MenuIcon>
                  <KeenIcon icon="setting" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.MEMBERS_&_ROLES" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/account/integrations">
                <MenuIcon>
                  <KeenIcon icon="switch" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.INTEGRATIONS" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuSeparator />
            <MenuItem>
              <MenuLink path="/account/security/overview">
                <MenuIcon>
                  <KeenIcon icon="shield-tick" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.NOTIFICATIONS" />
                </MenuTitle>
                <label className="switch switch-sm">
                  <input name="check" type="checkbox" checked onChange={() => { }} value="1" />
                </label>
              </MenuLink>
            </MenuItem>
          </MenuSub>
        </MenuItem>
        <MenuItem>
          <MenuLink path="https://devs.keenthemes.com">
            <MenuIcon>
              <KeenIcon icon="message-programming" />
            </MenuIcon>
            <MenuTitle>
              <FormattedMessage id="USER.MENU.DEV_FORUM" />
            </MenuTitle>
          </MenuLink>
        </MenuItem> */}
        <DropdownUserLanguages menuItemRef={menuItemRef} />
        <MenuSeparator />
      </div>
    </Fragment>;
  };
  const buildFooter = () => {
    return <div className="flex flex-col">
      <div className="menu-item mb-0.5">
        <div className="menu-link">
          <span className="menu-icon">
            <KeenIcon icon="moon" />
          </span>
          <span className="menu-title">
            <FormattedMessage id="USER.MENU.DARK_MODE" />
          </span>
          <label className="switch switch-sm">
            <input name="theme" type="checkbox" checked={settings.themeMode === 'dark'} onChange={handleThemeMode} value="1" />
          </label>
        </div>
      </div>

      <div className="menu-item px-4 py-1.5">
        <a onClick={() => logout(dispatch)} className="btn btn-sm btn-light justify-center">
          <FormattedMessage id="USER.MENU.LOGOUT" />
        </a>
      </div>
    </div>;
  };
  return <MenuSub className="menu-default light:border-gray-300 w-[200px] md:w-[250px]" rootClassName="p-0">
    {buildHeader()}
    {buildMenu()}
    {buildFooter()}
  </MenuSub>;
};
export { DropdownUser };
