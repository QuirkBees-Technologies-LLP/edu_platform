import { Fragment, useRef, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Demo1LightSidebarContent } from './';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import {
  Save,
  Users,
  Rss,
  Edit,
  X,
  Smile,
  Globe,
  Plus,
  Play,
  Video,
  Image,
} from 'lucide-react';
const Demo1LightSidebarPage = () => {
  const [date, setDate] = useState({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20)
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostExpanded, setIsPostExpanded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // You can now handle the file. For example, log its name to the console.
      console.log('Selected file:', file.name);
    }
  };

  return <Fragment>
    <Container>
      <Toolbar>
        <ToolbarHeading title="Dashboard" description="Central Hub for Personal Customization" />
        <ToolbarActions>
          <Popover>
            {/* <PopoverTrigger asChild>
                <button id="date" className={cn('btn btn-sm btn-light data-[state=open]:bg-light-active', !date && 'text-gray-400')}>
                  <KeenIcon icon="calendar" className="me-0.5" />
                  {date?.from ? date.to ? <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </> : format(date.from, 'LLL dd, y') : <span>Pick a date range</span>}
                </button>
              </PopoverTrigger> */}
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </ToolbarActions>
      </Toolbar>
    </Container>

    <Container>
      <Demo1LightSidebarContent />
    </Container>
    <Container>
      <div className="min-h-screen font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div className="md:col-span-1 lg:col-span-1 space-y-4">
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img src="https://i.ibb.co/gLV2tfjF/forex-banner.png" alt="Cover" className="w-full h-20 object-cover" />
                <div className='relative'>
                  <div className="absolute left-1/2 -translate-x-1/2 top-[-40px] h-[80px] w-[80px]">
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden">
                      <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center pt-8 pb-4 border-b border-gray-200 mt-3">
                <h2 className="text-lg font-semibold">Jhon Doe</h2>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 lg:col-span-4 space-y-4">
            <div className="card rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 text-left px-4 py-3 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Start a post
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors">
                  <Video size={20} className="text-red-500" />
                  <span className="text-sm hidden md:inline">Video</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors">
                  <Image size={20} className="text-green-500" />
                  <span className="text-sm hidden md:inline">Photo</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors">
                  <Edit size={20} className="text-blue-500" />
                  <span className="text-sm hidden md:inline">Write article</span>
                </button>
              </div>
            </div>
            <div className="card  rounded-lg shadow-md p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704e" alt="User" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">Design Studio</h3>
                      <p className="text-gray-500 text-xs">130,396 followers • 3d</p>
                    </div>
                    <button className="text-gray-500 hover:text-gray-900">
                      <X size={20} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                    {isPostExpanded
                      ? `When someone asks, "What do you do at Designathon?" Is it just work? Nope, it's way more—brainstorming, chaos, fun, arguments, laughter, and endless creativity. Don't believe us? Here's the proof! We get to build amazing things and collaborate with talented people from all over the world. It's an experience like no other.`
                      : `When someone asks, "What do you do at Designathon?" Is it just work? Nope, it's way more—brainstorming, chaos, fun, arguments, laughter, and endless creativity. Don't believe us? Here's the proof! ...`
                    }
                    <button type="button" onClick={() => setIsPostExpanded(prev => !prev)} className="text-primary hover:underline ml-1">
                      {isPostExpanded ? 'less' : 'more'}
                    </button>
                  </p>
                </div>
              </div>
              <div className="mt-4 relative">
                <img src="https://i.ibb.co/GQq97KXT/Frame-17.jpg" alt="Post content" className="w-full rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="p-4 bg-gray-900 bg-opacity-70 text-white dark:bg-primary rounded-full hover:bg-opacity-90 transition-opacity">
                    <Play size={32} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          
        </div>

        {/* The Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950 bg-opacity-40 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden transform transition-transform duration-300 ease-in-out scale-95">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Create a post</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Ravi Pansuriya</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Globe size={14} />
                      <span>Post to Anyone</span>
                    </div>
                  </div>
                </div>
                <textarea
                  className="w-full min-h-32 p-2 border-none resize-none focus:outline-none placeholder-gray-400 text-lg"
                  placeholder="What do you want to talk about?"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-md hover:bg-gray-100 transition-colors" type="button">
                      <Image size={20} />
                    </button>
                  </div>
                  <button className="btn btn-primary">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  </Fragment>;
};
export { Demo1LightSidebarPage };