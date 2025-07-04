import { Fragment, useEffect, useState } from 'react';
import { toAbsoluteUrl } from '@/utils/Assets';
import { useGetAdminDashboardQuery } from '../../../../../store/api/admin/adminProfileApiSlice';
const ChannelStats = () => {
  const items = [{
    logo: 'total-educators.png',
    logoDark: 'total-educators-dark.png',
    info: '9.3k',
    desc: 'Total Educators',
    path: ''
  }, {
    logo: 'total-Ideas.png',
    logoDark: 'total-Ideas-dark.png',
    info: '24k',
    desc: 'Total Ideas',
    path: ''
  }, {
    logo: 'total-courses.png',
    logoDark: 'total-courses-dark.png',
    info: '608',
    desc: 'Total Courses',
    path: ''
  }, {
    logo: 'live.png',
    logoDark: 'live-dark.png',
    info: '2.5k',
    desc: 'Total Stream Schedule',
    path: ''
  }];

  const [details, setDetails] = useState({});

  const { data } = useGetAdminDashboardQuery();

  // setDetails(data?.data);

  useEffect(() => {
    if (data) {
      setDetails(data?.data);
    }
  }, [data])

  const updatedItems = items.map((item) => {
    let count;

    switch (item.desc) {
      case 'Total Educators':
        count = details?.findEducatorCount;
        break;
      case 'Total Ideas':
        count = details?.findIdeaCount;
        break;
      case 'Total Courses':
        count = details?.findCourseCount;
        break;
      case 'Total Stream Schedule':
        count = details?.findScheduleCount;
        break;
      default:
        count = 0;
    }

    return {
      ...item,
      info: count
    };
  });


  const renderItem = (item, index) => {
    return <div key={index} className="card flex-col justify-between gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg">
      {item.logoDark ? <>
        <img src={toAbsoluteUrl(`/media/Icons/${item.logo}`)} className="dark:hidden w-7 mt-4 ms-5" alt="" />
        <img src={toAbsoluteUrl(`/media/Icons/${item.logoDark}`)} className="light:hidden w-7 mt-4 ms-5" alt="" />
      </> : <img src={toAbsoluteUrl(`/media/Icons/${item.logo}`)} className="w-7 mt-4 ms-5" alt="" />}

      <div className="flex flex-col gap-1 pb-4 px-5">
        <span className="text-3xl font-semibold text-gray-900">{item.info}</span>
        <span className="text-2sm font-normal text-gray-700">{item.desc}</span>
      </div>
    </div>;
  };
  return <Fragment>
    <style>
      {`
          .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
          }
          .dark .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
          }
        `}
    </style>

    {updatedItems.map((item, index) => {
      return renderItem(item, index);
    })}
  </Fragment>;
};
export { ChannelStats };