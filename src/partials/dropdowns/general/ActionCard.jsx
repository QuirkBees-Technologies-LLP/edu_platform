import { KeenIcon, MenuArrow, MenuIcon, MenuItem, MenuLink, MenuSeparator, MenuSub, MenuTitle } from '@/components';
import { useLanguage } from '@/i18n';
const ActionCard = () => {
  const {
    isRTL
  } = useLanguage();
  return <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem>
        <MenuLink path="/account/activity">
          <MenuIcon>
          <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem>
        <MenuLink path="#">
          <MenuIcon>
          <KeenIcon icon="trash" />
          </MenuIcon>
          <MenuTitle>Delete</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>;
};
export { ActionCard };