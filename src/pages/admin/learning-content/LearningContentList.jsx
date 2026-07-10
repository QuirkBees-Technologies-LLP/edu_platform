/* eslint-disable prettier/prettier */
import * as React from "react";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
import { Loader2, Upload, Moon, Sun, X } from "lucide-react";
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  KeenIcon,
  useDataGrid,
  Menu,
  MenuItem,
  MenuToggle,
  MenuSub,
  MenuLink,
  MenuIcon,
  MenuTitle,
} from "@/components";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLazyGetLearningContentListQuery,
  useDeleteLearningContentMutation,
  useToggleLearningContentStatusMutation,
  useCreateLearningContentMutation,
  useUpdateLearningContentMutation,
} from "../../../store/api/admin/adminLearningContentApiSlice";
import { useGetAdminStrategyModelsQuery } from "../../../store/api/admin/adminStrategyModelApiSlice";
import { useGetLanguagesQuery } from "../../../store/api/admin/adminLanguagesApiSlice";

// ── Language Multi-Select Dropdown Component ──────────────────────────
const LanguageMultiSelect = ({ languages, selected, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const allSelected = languages.length > 0 && selected.length === languages.length;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(languages.map((l) => l._id));
    }
  };

  const toggleOne = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((sid) => sid !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  // Build display text
  const displayText =
    selected.length === 0
      ? "Select Languages"
      : allSelected
        ? "All Languages"
        : `${selected.length} Language${selected.length > 1 ? "s" : ""} selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-left outline-none transition-all ${error
          ? "border-rose-500"
          : isOpen
            ? "border-indigo-500/50 ring-1 ring-indigo-500/20"
            : ""
          }`}
      >
        <span className={selected.length === 0 ? "text-gray-400" : "text-gray-800 dark:text-white"}>
          {displayText}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg shadow-lg max-h-[220px] overflow-y-auto">
          {/* All Option */}
          <label className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2d35] border-b dark:border-gray-700">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
            />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">All</span>
          </label>
          {/* Individual Languages */}
          {languages.map((l) => (
            <label
              key={l._id}
              className="flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2d35]"
            >
              <input
                type="checkbox"
                checked={selected.includes(l._id)}
                onChange={() => toggleOne(l._id)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-gray-700 dark:text-white">{l.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const INITIAL_FORM_DATA = {
  contentType: "FAST_START",
  strategy: "",
  language: [],
  title: "",
  description: "",
  darkModeImageFile: null,
  lightModeImageFile: null,
  darkModeImagePreview: "",
  lightModeImagePreview: "",
};

const LearningContentList = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const [contentType, setContentType] = useState(searchParams.get("tab") || "FAST_START");
  const [tableKey, setTableKey] = useState(0);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // ── Create/Edit Modal State ─────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  const isEditMode = Boolean(editingId);

  const [fetchContent, { isLoading }] = useLazyGetLearningContentListQuery();
  const [deleteContent, { isLoading: isDeleting }] =
    useDeleteLearningContentMutation();
  const [toggleStatus] = useToggleLearningContentStatusMutation();
  const [createContent, { isLoading: isCreating }] =
    useCreateLearningContentMutation();
  const [updateContent, { isLoading: isUpdating }] =
    useUpdateLearningContentMutation();

  // Fetch strategies and languages for create modal dropdowns
  const { data: strategiesData } = useGetAdminStrategyModelsQuery();
  const { data: languagesData } = useGetLanguagesQuery({
    page: 1,
    limit: 100,
    search: "",
  });
  const strategies = strategiesData?.data || [];
  const languages = languagesData?.data || [];

  const reloadTable = () => setTableKey((k) => k + 1);

  // ── Create/Edit Modal Handlers ─────────────────────────────────────
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ ...INITIAL_FORM_DATA, contentType });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const openEditModal = (rowData) => {
    setEditingId(rowData._id);
    setFormData({
      contentType: rowData.contentType || "FAST_START",
      strategy: rowData.strategy?._id || rowData.strategy || "",
      language: Array.isArray(rowData.language)
        ? rowData.language.map((l) => l._id || l)
        : rowData.language?._id
          ? [rowData.language._id]
          : [],
      title: rowData.title || "",
      description: rowData.description || "",
      darkModeImageFile: null,
      lightModeImageFile: null,
      darkModeImagePreview: rowData.darkModeImage || "",
      lightModeImagePreview: rowData.lightModeImage || "",
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFormSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    // if (!formData.language || formData.language.length === 0)
    //   newErrors.language = "At least one language is required";
    if (formData.contentType === "STRATEGY" && !formData.strategy) {
      newErrors.strategy = "Strategy is required for Strategy type";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("contentType", formData.contentType);
    fd.append("title", formData.title.trim());
    fd.append("description", (formData.description || "").trim());

    if (formData.contentType === "STRATEGY") {
      fd.append("strategy", formData.strategy);
    }

    // Append image files if selected
    if (formData.darkModeImageFile) {
      fd.append("darkModeImage", formData.darkModeImageFile);
    }
    if (formData.lightModeImageFile) {
      fd.append("lightModeImage", formData.lightModeImageFile);
    }

    try {
      if (isEditMode) {
        await updateContent({ id: editingId, formData: fd }).unwrap();
        toast.success("Content updated successfully");
      } else {
        await createContent(fd).unwrap();
        toast.success("Content created successfully");
      }
      setIsCreateOpen(false);
      setEditingId(null);
      setFormData(INITIAL_FORM_DATA);
      reloadTable();
    } catch (err) {
      const msg =
        err?.data?.message || err?.data?.errors?.[0] || "Operation failed";
      toast.error(msg);
    }
  };

  // ── Server-side fetch for DataGrid ──────────────────────────────────
  const handleFetchData = useCallback(
    async ({ pageIndex, pageSize, filters }) => {
      try {
        const searchFilter = filters?.find((f) => f.id === "title");
        const response = await fetchContent({
          contentType,
          page: pageIndex + 1,
          limit: pageSize,
          search: searchFilter?.value || "",
        }).unwrap();

        return {
          data: response.data || [],
          totalCount: response.pagination?.total || 0,
        };
      } catch (error) {
        console.error("Error fetching learning content:", error);
        return { data: [], totalCount: 0 };
      }
    },
    [contentType, fetchContent]
  );

  // ── Toggle status handler ────────────────────────────────────────────
  const handleToggleStatus = async (row) => {
    try {
      await toggleStatus({
        id: row._id,
        status: !row.status,
      }).unwrap();
      toast.success(
        `Content ${!row.status ? "enabled" : "disabled"} successfully`
      );
      reloadTable();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  // ── Delete handler ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedRow) return;
    try {
      await deleteContent(selectedRow._id).unwrap();
      toast.success("Content deleted successfully");
      setIsDeleteOpen(false);
      setSelectedRow(null);
      reloadTable();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete content");
    }
  };

  // ── Action Menu ─────────────────────────────────────────────────────
  const ActionMenu = (rowData) => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem
        onClick={() => navigate(`/admin/learning-content/${rowData._id}`)}
      >
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="eye" />
          </MenuIcon>
          <MenuTitle>View Details</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem
        onClick={() => openEditModal(rowData)
        }
      >
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Edit</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem onClick={() => handleToggleStatus(rowData)}>
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon={rowData.status ? "shield-cross" : "shield-tick"} />
          </MenuIcon>
          <MenuTitle>
            {rowData.status ? "Disable" : "Enable"}
          </MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem
        onClick={() => {
          setSelectedRow(rowData);
          setIsDeleteOpen(true);
        }}
      >
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="trash" />
          </MenuIcon>
          <MenuTitle>Delete</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );

  // ── DataGrid columns ─────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.title,
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex flex-col gap-0.5">
            <a
              className="leading-none font-medium text-sm text-gray-900 hover:text-primary cursor-pointer"
              onClick={() =>
                navigate(
                  `/admin/learning-content/${info.row.original._id}`
                )
              }
            >
              {info.row.original.title}
            </a>
            {info.row.original.description && (
              <span className="text-xs text-gray-500 line-clamp-1">
                {info.row.original.description}
              </span>
            )}
          </div>
        ),
        meta: {
          headerClassName: "min-w-[250px]",
        },
      },
      ...(contentType === "STRATEGY"
        ? [
          {
            accessorFn: (row) => row.strategy?.title,
            id: "strategy",
            header: ({ column }) => (
              <DataGridColumnHeader title="Strategy" column={column} />
            ),
            enableSorting: true,
            cell: (info) => (
              <span className="text-gray-800 text-sm">
                {info.row.original.strategy?.title || "—"}
              </span>
            ),
            meta: {
              headerClassName: "min-w-[150px]",
            },
          },
        ]
        : []),
      // Language column (commented out - language disabled for now)
      // {
      //   accessorFn: (row) =>
      //     Array.isArray(row.language)
      //       ? row.language.map((l) => l?.name).filter(Boolean).join(", ")
      //       : row.language?.name || "",
      //   id: "language",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Language" column={column} />
      //   ),
      //   enableSorting: true,
      //   cell: (info) => {
      //     const langs = info.row.original.language;
      //     const display = Array.isArray(langs)
      //       ? langs.map((l) => l?.name).filter(Boolean).join(", ")
      //       : langs?.name || "—";
      //     return (
      //       <span className="text-gray-800 text-sm">
      //         {display || "—"}
      //       </span>
      //     );
      //   },
      //   meta: {
      //     headerClassName: "min-w-[150px]",
      //   },
      // },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          const status = info.row.original.status;
          return (
            <span
              className={`badge badge-sm badge-outline ${status ? "badge-success" : "badge-danger"
                }`}
            >
              {status ? "Published" : "Unpublished"}
            </span>
          );
        },
        meta: {
          headerClassName: "w-[100px]",
        },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-600 text-sm">
            {new Date(info.row.original.createdAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            )}
          </span>
        ),
        meta: {
          headerClassName: "min-w-[130px]",
        },
      },
      {
        id: "actions",
        header: () => "",
        enableSorting: false,
        cell: ({ row }) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? "bottom-start" : "bottom-end",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: isRTL() ? [0, -10] : [0, 10],
                    },
                  },
                ],
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {ActionMenu(row.original)}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: "w-[60px]",
        },
      },
    ],
    [isRTL, contentType, navigate]
  );

  // ── Toolbar inside DataGrid ──────────────────────────────────────────
  const ToolbarTable = () => {
    const { table } = useDataGrid();
    return (
      <div className="card-header px-5 py-5 border-b-0 flex-wrap gap-2">
        <h3 className="card-title">Learning Content</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid pb-5">
      {/* Content Type Tabs */}
      <div className="pb-5">
        <div className="inline-flex bg-gray-200 dark:bg-[#1a1c23] rounded-lg p-1">
          <button
            onClick={() => {
              setContentType("FAST_START");
              reloadTable();
            }}
            className={`px-2 sm:px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${contentType === "FAST_START"
              ? "bg-gray-100 dark:bg-[#2a2d35] text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-800"
              }`}
          >
            Fast Start Training
          </button>
          <button
            onClick={() => {
              setContentType("STRATEGY");
              reloadTable();
            }}
            className={`px-2 sm:px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${contentType === "STRATEGY"
              ? "bg-gray-100 dark:bg-[#2a2d35] text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-800"
              }`}
          >
            Strategy
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Learning Content" />
          <ToolbarDescription>
            Manage dynamic learning videos and resources for students
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="text-end">
            <button
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              Add Content
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>

      {/* DataGrid */}
      <DataGrid
        key={contentType}
        reloadTrigger={tableKey}
        serverSide={true}
        loading={isLoading}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<ToolbarTable />}
        layout={{ card: true }}
        onFetchData={handleFetchData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Learning Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{selectedRow?.title}"</strong>? This will also delete all
              associated videos and resources. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="btn btn-light"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedRow(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create/Edit Content Modal ──────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) { setEditingId(null); setFormErrors({}); }
      }}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? "Edit Learning Content"
                : formData.contentType === "FAST_START"
                  ? "Create Fast Start Training Content"
                  : "Create Strategy Content"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update title, description, and settings"
                : "Set up new learning content for students"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-5 py-4">

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Welcome! or DEFY"
                  className={`w-full dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all ${formErrors.title ? "border-rose-500" : ""
                    }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-rose-500 mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>
              {/* Language Multi-Select Dropdown (commented out - language disabled for now) */}
              {/* <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Language <span className="text-rose-500">*</span>
                </label>
                <LanguageMultiSelect
                  languages={Array.isArray(languages) ? languages : []}
                  selected={formData.language}
                  onChange={(newLangs) => {
                    setFormData((prev) => ({ ...prev, language: newLangs }));
                    setFormErrors((prev) => ({ ...prev, language: "" }));
                  }}
                  error={formErrors.language}
                />
                {formErrors.language && (
                  <p className="text-xs text-rose-500 mt-1">
                    {formErrors.language}
                  </p>
                )}
              </div> */}

              {/* Strategy Dropdown (only for STRATEGY type) */}
              {formData.contentType === "STRATEGY" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Strategy <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={formData.strategy}
                    onValueChange={(val) =>
                      handleFormSelectChange("strategy", val)
                    }
                  >
                    <SelectTrigger
                      className={`w-full ${formErrors.strategy ? "border-rose-500" : ""}`}
                    >
                      <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.strategy && (
                    <p className="text-xs text-rose-500 mt-1">
                      {formErrors.strategy}
                    </p>
                  )}
                </div>
              )}



              {/* Dark / Light Mode Images — side by side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Dark Mode Image */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-white">
                    <Moon size={14} className="text-blue-400" />
                    Dark Mode Image
                  </label>
                  {(formData.darkModeImagePreview || formData.darkModeImageFile) ? (
                    <div className="relative group rounded-xl border-2 p-3 flex items-center justify-center min-h-[100px]" >
                      <img
                        src={formData.darkModeImageFile ? URL.createObjectURL(formData.darkModeImageFile) : formData.darkModeImagePreview}
                        alt="Dark mode preview"
                        className="max-h-20 w-auto object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-1.5 right-1.5 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => setFormData((prev) => ({ ...prev, darkModeImageFile: null, darkModeImagePreview: "" }))}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center min-h-[100px] rounded-xl border-2 border-dashed border-gray-600 dark:border-gray-600 bg-gray-800/40 hover:bg-gray-800/60 hover:border-indigo-500/50 cursor-pointer transition-all group">
                      <Upload size={20} className="text-gray-500 group-hover:text-blue-700 transition-colors mb-1.5" />
                      <span className="text-xs text-gray-500 group-hover:text-blue-700 transition-colors font-medium">Click to upload</span>
                      <span className="text-[10px] text-gray-600 mt-0.5">PNG, JPG, WEBP</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFormData((prev) => ({ ...prev, darkModeImageFile: file }));
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Light Mode Image */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-white">
                    <Sun size={14} className="text-blue-700" />
                    Light Mode Image
                  </label>
                  {(formData.lightModeImagePreview || formData.lightModeImageFile) ? (
                    <div className="relative group rounded-xl border-2 p-3 flex items-center justify-center min-h-[100px]" >
                      <img
                        src={formData.lightModeImageFile ? URL.createObjectURL(formData.lightModeImageFile) : formData.lightModeImagePreview}
                        alt="Light mode preview"
                        className="max-h-20 w-auto object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-1.5 right-1.5 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => setFormData((prev) => ({ ...prev, lightModeImageFile: null, lightModeImagePreview: "" }))}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center min-h-[100px] rounded-xl border-2 border-dashed border-gray-600 dark:border-gray-600 bg-gray-800/40 hover:bg-gray-800/60 hover:border-indigo-500/50 cursor-pointer transition-all group">
                      <Upload size={20} className="text-gray-500 group-hover:text-blue-700 transition-colors mb-1.5" />
                      <span className="text-xs text-gray-500 group-hover:text-blue-700 transition-colors font-medium">Click to upload</span>
                      <span className="text-[10px] text-gray-600 mt-0.5">PNG, JPG, WEBP</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFormData((prev) => ({ ...prev, lightModeImageFile: file }));
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="btn btn-primary"
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearningContentList;
