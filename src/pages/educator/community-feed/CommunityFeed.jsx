import React, { useState, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { CreatePostModal } from "./create-post-modal";
import { Video, ImageIcon, FileText, Heart, Users, TrendingUp, Clock, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { ThemeToggle } from "./theme-toggle";
import { PostMenu } from "./post-menu";
import { SearchBar } from "./search-bar";
import { useToast } from "./toast";
import { filterPosts, sortPosts, getPostStats } from "../utils/post-utils";

const tradingPosts = [
  {
    id: "1",
    author: {
      name: "Carlos",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    content:
      "📈 Exit Strategy Alert!\n\nJust closed my AAPL position at $185.50 after a solid 12% gain. Here's why I decided to exit:\n\n✅ Hit my predetermined profit target\n✅ RSI showing overbought conditions\n✅ Volume declining on recent rallies\n\nRemember: It's not about timing the perfect top, it's about taking profits when your plan says to. The market will always give you another opportunity.\n\n#TradingTips #ExitStrategy #AAPL",
    image: "/placeholder.svg?height=300&width=500",
    timeAgo: "2h",
    engagement: {
      likes: 156,
    },
    isLiked: false,
  },
  {
    id: "2",
    author: {
      name: "Carlos",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    content:
      "🚨 When to Exit a Losing Trade 🚨\n\nSaw too many traders hold losing positions hoping for a comeback today. Here are my non-negotiable exit rules:\n\n1️⃣ Stop loss hit = immediate exit (no exceptions)\n2️⃣ Thesis invalidated = close the position\n3️⃣ Risk/reward no longer favorable = get out\n4️⃣ Emotional attachment forming = danger zone\n\nYour capital preservation is more important than being right. Live to trade another day! 💪\n\n#RiskManagement #TradingPsychology #StopLoss",
    timeAgo: "4h",
    engagement: {
      likes: 289,
    },
    isLiked: true,
  },
  {
    id: "3",
    author: {
      name: "Carlos",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    content:
      "💡 Exit Timing Masterclass\n\nAfter 8 years of trading, here's what I've learned about exits:\n\n🎯 PROFIT EXITS:\n• Scale out at key resistance levels\n• Trail stops on strong trends\n• Take profits at Fibonacci extensions\n\n🛑 LOSS EXITS:\n• Honor your stop loss ALWAYS\n• Exit on pattern breakdown\n• Close on fundamental changes\n\nThe best traders aren't the ones who pick perfect entries - they're the ones who master their exits.\n\nWhat's your exit strategy? Drop it below! 👇\n\n#Trading #Strategy #Fibonacci",
    image: "/placeholder.svg?height=400&width=600",
    timeAgo: "6h",
    engagement: {
      likes: 198,
    },
    isLiked: false,
  },
  {
    id: "4",
    author: {
      name: "Carlos",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    content:
      "⚡ Options Exit Strategy Alert!\n\nJust closed my SPY put spread for 80% max profit instead of holding to expiration. Here's why:\n\n✅ Captured most of the potential profit\n✅ Reduced assignment risk\n✅ Freed up capital for new opportunities\n✅ Avoided theta decay in final days\n\nIn options trading, sometimes 80% profit in 3 days beats 100% profit in 10 days. Time is money! ⏰\n\n#OptionsTrading #SPY #ProfitTaking",
    timeAgo: "8h",
    engagement: {
      likes: 124,
    },
    isLiked: false,
  },
  {
    id: "5",
    author: {
      name: "Carlos",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    content:
      "📊 Swing Trading Exit Signals\n\nSpotted these exit signals on TSLA today:\n\n🔴 Bearish divergence on RSI\n🔴 Volume drying up on rallies\n🔴 Failed to break key resistance at $250\n🔴 Market showing signs of weakness\n\nExited 75% of my position at $247.80. Keeping 25% with a trailing stop at $240.\n\nSometimes the best trade is the one you don't make. When in doubt, take profits and reassess.\n\n#SwingTrading #TSLA #TechnicalAnalysis",
    image: "/placeholder.svg?height=350&width=550",
    timeAgo: "12h",
    engagement: {
      likes: 167,
    },
    isLiked: true,
  },
  {
    id: "6",
    author: {
      name: "Carlos",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    content:
      "🚀 Crypto Exit Strategy Update\n\nBitcoin hit my first target at $45K! Here's my exit plan:\n\n📈 SCALING OUT:\n• 25% at $45K ✅ (DONE)\n• 25% at $48K (pending)\n• 25% at $52K (pending)\n• 25% runner with trailing stop\n\nThis approach lets me:\n✅ Lock in profits\n✅ Reduce risk\n✅ Stay in the game for bigger moves\n\nNever go broke taking profits! The key is having a plan and sticking to it.\n\n#Bitcoin #CryptoTrading #ExitStrategy #Cryptocurrency",
    timeAgo: "1d",
    engagement: {
      likes: 203,
    },
    isLiked: false,
  },
  {
    id: "7",
    author: {
      name: "Carlos",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    content:
      "🎯 Risk Management is Everything!\n\nJust had a conversation with a new trader who asked: 'What's the most important skill in trading?'\n\nMy answer: Risk management. Always.\n\nHere's why:\n• You can be wrong 60% of the time and still be profitable\n• One bad trade without a stop loss can wipe out months of gains\n• Position sizing determines your long-term success\n\nMaster risk management first, profits will follow.\n\n#RiskManagement #Trading101 #TradingEducation",
    timeAgo: "now",
    engagement: {
      likes: 45,
    },
    isLiked: false,
  },
];

export function CommunityFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState(tradingPosts);
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const videoInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { showToast } = useToast();

  // Filter and sort posts based on search query and sort option
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = filterPosts(posts, searchQuery);
    return sortPosts(filtered, sortBy);
  }, [posts, searchQuery, sortBy]);

  // Get stats for the current filtered posts
  const stats = useMemo(() => getPostStats(filteredAndSortedPosts), [filteredAndSortedPosts]);

  const handleCreatePost = (content, images) => {
    const newPost = {
      id: Date.now().toString(),
      author: {
        name: "Carlos",
        avatar: "/placeholder.svg?height=48&width=48",
      },
      content,
      image: images.length > 0 ? URL.createObjectURL(images[0]) : undefined,
      timeAgo: "now",
      engagement: {
        likes: 0,
      },
      isLiked: false,
    };
    setPosts((prev) => [newPost, ...prev]);

    // Show success toast
    showToast("Post shared successfully! 🎉", "success");
  };

  const handleVideoUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Video files selected:", files);
    }
  };

  const handlePhotoUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Photo files selected:", files);
    }
  };

  const handleDocUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Document files selected:", files);
    }
  };

  const toggleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              engagement: {
                ...post.engagement,
                likes: post.isLiked ? post.engagement.likes - 1 : post.engagement.likes + 1,
              },
            }
          : post
      )
    );
  };

  const getSortIcon = (sortType) => {
    switch (sortType) {
      case "recent":
        return <Clock className="w-4 h-4" />;
      case "top":
        return <TrendingUp className="w-4 h-4" />;
      case "relevant":
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSortDescription = (sortType) => {
    switch (sortType) {
      case "recent":
        return "Latest posts first";
      case "top":
        return "Most liked posts";
      case "relevant":
        return "Best engagement";
      default:
        return "";
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <ThemeToggle />

        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Hidden file inputs with proper filtering */}
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoUpload}
            accept=".mp4,.avi,.mov,.wmv,.flv,.webm"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoUpload}
            accept=".jpeg,.jpg,.png,.gif,.bmp,.webp"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={docInputRef}
            onChange={handleDocUpload}
            accept=".doc,.docx,.ppt,.pptx"
            multiple
            className="hidden"
          />

          {/* Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-[#c88a21]" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#c88a21] to-[#b8791e] bg-clip-text text-transparent">
                Community Feed
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-300">
              Connect, share, and engage with the community
            </p>
          </div>

          {/* Create Post Section */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-14 h-14 ring-2 ring-gray-100 dark:ring-gray-700">
                  <AvatarImage src="/placeholder.svg?height=56&width=56" />
                  <AvatarFallback className="bg-gradient-to-br from-[#c88a21] to-[#b8791e] text-white font-semibold text-lg">
                    C
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-full h-12 text-lg shadow-sm hover:shadow-md transition-all"
                  onClick={() => setIsModalOpen(true)}
                >
                  What's on your mind today?
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-all duration-200"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <Video className="w-6 h-6" />
                      </Button>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Video</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>MP4, AVI, MOV, WMV, FLV, WebM</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full hover:bg-[#c88a21] hover:text-white transition-all duration-200"
                        style={{ color: "#c88a21" }}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <ImageIcon className="w-6 h-6" />
                      </Button>
                      <span className="text-sm font-medium" style={{ color: "#c88a21" }}>
                        Photo
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>JPEG, JPG, PNG, GIF, BMP, WebP</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200"
                        onClick={() => docInputRef.current?.click()}
                      >
                        <FileText className="w-6 h-6" />
                      </Button>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Upload doc</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>DOC, DOCX, PPT, PPTX</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <SearchBar onSearch={setSearchQuery} />

            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-auto border-0 p-0 h-auto bg-transparent text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    {getSortIcon(sortBy)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem
                    value="recent"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <div>
                        <div>Recent</div>
                        <div className="text-xs text-gray-500">Latest posts first</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="top"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <div>
                        <div>Top</div>
                        <div className="text-xs text-gray-500">Most liked posts</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="relevant"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <div>
                        <div>Relevant</div>
                        <div className="text-xs text-gray-500">Best engagement</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    {filteredAndSortedPosts.length} result{filteredAndSortedPosts.length !== 1 ? "s" : ""} for "
                    {searchQuery}"
                  </p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">
                    Searching in posts, hashtags, and usernames
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30"
                >
                  Clear search
                </Button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-[#c88a21]">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-red-500">{stats.totalLikes}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-500">{stats.avgLikes}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Likes</div>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {filteredAndSortedPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {searchQuery ? "No posts found" : "No posts yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  {searchQuery
                    ? `Try searching for something else or check your spelling.`
                    : "Be the first to share something with the community!"}
                </p>
              </div>
            ) : (
              filteredAndSortedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 ring-2 ring-gray-100 dark:ring-gray-700">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-[#c88a21] to-[#b8791e] text-white font-semibold">
                          C
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">{post.author.name}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">• {post.timeAgo}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Community Member</p>
                      </div>
                      <PostMenu
                        postId={post.id}
                        isOwnPost={post.author.name === "Carlos"}
                        onEdit={() => showToast("Edit functionality coming soon!", "info")}
                        onDelete={() => showToast("Delete functionality coming soon!", "info")}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed transition-colors duration-300">
                      {post.content}
                    </p>

                    {post.image && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Post content"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    {/* Only Like button */}
                    <div className="flex items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all duration-300 ${
                          post.isLiked
                            ? "text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 shadow-md"
                            : "text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        }`}
                      >
                        <Heart className={`w-5 h-5 transition-all ${post.isLiked ? "fill-current scale-110" : ""}`} />
                        <span className="font-medium">{post.engagement.likes}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPost={handleCreatePost} />
        </div>
      </div>
    </TooltipProvider>
  );
}