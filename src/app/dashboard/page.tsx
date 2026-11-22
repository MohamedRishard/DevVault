"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchAndFilter from "@/components/SearchAndFilter";
import ResourceCard from "@/components/ResourceCard";
import ResourceModal from "@/components/ResourceModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { Resource } from "@/types";
import { Plus, ShieldAlert, Sparkles, FolderOpen, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { showToast } = useToast();

  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: "",
    title: "",
    isDeleting: false,
  });

  // Fetch current user and resources
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, resourcesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/resources"),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData?.user?.email) {
          setUserEmail(userData.user.email);
        }
      }

      if (resourcesRes.ok) {
        const resData = await resourcesRes.json();
        setResources(resData.resources || []);
        if (Array.isArray(resData.categories)) {
          setCategories(resData.categories);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      showToast("Failed to load your resources", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side search and category filtering
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // Category match
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      // Query match (across title, description, url, mainFunctions)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = (item.description || "").toLowerCase().includes(q);
      const urlMatch = item.url.toLowerCase().includes(q);
      const funcMatch = (item.mainFunctions || []).some((f) =>
        f.toLowerCase().includes(q)
      );

      return titleMatch || descMatch || urlMatch || funcMatch;
    });
  }, [resources, selectedCategory, searchQuery]);

  // Handle Add or Edit submit
  const handleModalSubmit = async (formData: {
    title: string;
    url: string;
    category: string;
    description: string;
    mainFunctions: string[];
    isPinned: boolean;
  }) => {
    if (editingResource) {
      // Update
      const res = await fetch(`/api/resources/${editingResource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update resource");
      }

      const { resource } = await res.json();
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? resource : r))
      );
      showToast("Resource updated successfully!", "success");
    } else {
      // Create
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create resource");
      }

      const { resource } = await res.json();
      setResources((prev) => [resource, ...prev]);
      if (!categories.includes(resource.category)) {
        setCategories((prev) => [...prev, resource.category]);
      }
      showToast("New resource added to DevVault!", "success");
    }
  };

  // Handle Pin / Unpin quick toggle
  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });

      if (!res.ok) throw new Error("Failed to update pin state");

      const { resource } = await res.json();
      setResources((prev) =>
        prev.map((r) => (r.id === id ? resource : r))
      );
      showToast(
        isPinned ? "Resource pinned to top!" : "Resource unpinned",
        "info"
      );
    } catch {
      showToast("Failed to update pin status", "error");
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    const { id } = deleteConfirm;
    if (!id) return;

    try {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Failed to delete resource");

      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast("Resource deleted from vault", "success");
      setDeleteConfirm({ isOpen: false, id: "", title: "", isDeleting: false });
    } catch {
      showToast("Failed to delete resource", "error");
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFECCB] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        email={userEmail}
        onOpenAddModal={() => {
          setEditingResource(null);
          setIsModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Search & Category Pills Filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalCount={resources.length}
          filteredCount={filteredResources.length}
        />

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#E00000] mb-3" />
            <p className="text-sm font-bold text-charcoal">Loading your vault resources...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          /* Responsive Cards Grid: 1 / 2 / 3 columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={(res) => {
                  setEditingResource(res);
                  setIsModalOpen(true);
                }}
                onDelete={(id, title) => {
                  setDeleteConfirm({
                    isOpen: true,
                    id,
                    title,
                    isDeleting: false,
                  });
                }}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border-2 border-[#FFA97B] p-12 text-center max-w-lg mx-auto shadow-card my-12">
            <div className="w-16 h-16 rounded-2xl bg-[#FFECCB] border-2 border-[#FFA97B] text-[#E00000] flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">
              {searchQuery || selectedCategory !== "All"
                ? "No matching resources found"
                : "Your Vault is Empty"}
            </h3>
            <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
              {searchQuery || selectedCategory !== "All"
                ? "Try searching for a different keyword or choose another category filter."
                : "Start curating your personal collection of developer tools, cybersecurity labs, and GitHub repositories."}
            </p>
            <button
              onClick={() => {
                if (searchQuery || selectedCategory !== "All") {
                  setSearchQuery("");
                  setSelectedCategory("All");
                } else {
                  setEditingResource(null);
                  setIsModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E00000] hover:bg-[#C00000] text-white font-bold text-sm shadow-vault transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>
                {searchQuery || selectedCategory !== "All"
                  ? "Clear Filters"
                  : "Add First Resource"}
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Add / Edit Resource Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResource(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingResource}
        existingCategories={categories}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Resource?"
        message={`Are you sure you want to permanently delete "${deleteConfirm.title}" from your vault? This action cannot be undone.`}
        confirmLabel="Delete Resource"
        isDestructive={true}
        isLoading={deleteConfirm.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirm({ isOpen: false, id: "", title: "", isDeleting: false })
        }
      />
    </div>
  );
}
