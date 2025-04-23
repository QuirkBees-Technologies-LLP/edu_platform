import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { useLayout } from '@/providers';
import { toAbsoluteUrl } from '@/utils/Assets';
import { UserProfileHero } from './userProfileHero';
import RecordedLive from './RecordedLive';
import Courses from './Courses';

const EducatorDetailPage = () => {
    const {
        currentLayout
    } = useLayout();
    const image = <img src={toAbsoluteUrl('/media/avatars/300-1.png')} className="rounded-full border-3 border-success size-[100px] shrink-0" />;

    return (
        <div className='container-fluid'>

            <div className="flex items-center justify-center">
                        <UserProfileHero name="Jenny Klabber" image={image} info={[{
                            label: 'KeenThemes',
                            icon: 'abstract-41'
                        }, {
                            label: 'SF, Bay Area',
                            icon: 'geolocation'
                        }, {
                            email: 'jenny@kteam.com',
                            icon: 'sms'
                        }]} />
            </div>
            <Courses />
            <RecordedLive />
        </div>
    )



};
export { EducatorDetailPage };
