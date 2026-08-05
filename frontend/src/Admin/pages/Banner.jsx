import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Eye, EyeOff, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { getHomeContent, updateHomeContent } from "../../api/homeApi.js";

const emptySlide = {
  title: "",
  highlight: "",
  description: "",
  imageKey: "hero1",
  isActive: true,
};

const imageOptions = [
  { value: "hero1", label: "Bright living" },
  { value: "hero2", label: "Appliance collection" },
  { value: "hero3", label: "Home appliances" },
  { value: "hero4", label: "Dream home décor" },
  { value: "hero5", label: "Electrical products" },
];

export default function Banner() {
  const queryClient = useQueryClient();
  const [slides, setSlides] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(emptySlide);

  const { data: homeContent, isLoading, isError, refetch } = useQuery({
    queryKey: ["homeContent"],
    queryFn: getHomeContent,
  });

  useEffect(() => {
    if (homeContent?.heroSlides) setSlides(homeContent.heroSlides);
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (heroSlides) =>
      updateHomeContent({
        heroSlides,
        features: homeContent?.features || [],
        services: homeContent?.services || [],
        trustFeatures: homeContent?.trustFeatures || [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeContent"] });
      toast.success("Homepage banners saved");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Could not save banners"),
  });

  const saveSlides = (nextSlides) => {
    setSlides(nextSlides);
    saveMutation.mutate(nextSlides);
  };

  const resetForm = () => {
    setForm(emptySlide);
    setEditingIndex(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.highlight.trim() || !form.description.trim()) {
      toast.error("Heading and description are required");
      return;
    }
    const nextSlide = { ...form, title: form.title.trim(), highlight: form.highlight.trim(), description: form.description.trim() };
    const nextSlides = editingIndex === null
      ? [...slides, nextSlide]
      : slides.map((slide, index) => (index === editingIndex ? nextSlide : slide));
    saveSlides(nextSlides);
    resetForm();
  };

  const editSlide = (index) => {
    const slide = slides[index];
    setForm({
      ...emptySlide,
      ...slide,
      description: slide.description || slide.desc || "",
    });
    setEditingIndex(index);
  };

  const removeSlide = (index) => {
    if (!window.confirm("Remove this homepage banner?")) return;
    saveSlides(slides.filter((_, slideIndex) => slideIndex !== index));
    if (editingIndex === index) resetForm();
  };

  const toggleSlide = (index) => {
    saveSlides(slides.map((slide, slideIndex) => (
      slideIndex === index ? { ...slide, isActive: slide.isActive === false } : slide
    )));
  };

  if (isLoading) return <div className="p-6 text-gray-500">Loading homepage content…</div>;
  if (isError) {
    return <div className="p-6"><button onClick={() => refetch()} className="rounded-lg bg-red-600 px-4 py-2 text-white">Retry loading banners</button></div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homepage Banners</h1>
          <p className="text-gray-500">Control the hero carousel visitors see on the home page.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{slides.filter((slide) => slide.isActive !== false).length} active</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          {slides.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
              <ImagePlus className="mx-auto mb-3 text-gray-400" size={36} />
              No custom banners yet. Add one below to replace the default carousel.
            </div>
          ) : slides.map((slide, index) => (
            <article key={`${slide.title}-${index}`} className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">{index + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">{slide.title} <span className="text-red-600">{slide.highlight}</span></h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${slide.isActive === false ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                    {slide.isActive === false ? "Hidden" : "Live"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{slide.description || slide.desc}</p>
                <p className="mt-2 text-xs text-gray-400">Image: {imageOptions.find((image) => image.value === slide.imageKey)?.label || "Default image"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleSlide(index)} title="Show or hide" className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50">
                  {slide.isActive === false ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => editSlide(index)} title="Edit banner" className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"><Edit3 size={18} /></button>
                <button onClick={() => removeSlide(index)} title="Remove banner" className="rounded-lg border p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 xl:sticky xl:top-24">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingIndex === null ? "Add banner" : "Edit banner"}</h2>
            {editingIndex !== null && <button onClick={resetForm} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium">Heading
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brighter living," maxLength={60} />
            </label>
            <label className="block text-sm font-medium">Highlighted text
              <input value={form.highlight} onChange={(event) => setForm({ ...form, highlight: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Better every day" maxLength={60} />
            </label>
            <label className="block text-sm font-medium">Description
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Short banner description" maxLength={220} />
            </label>
            <label className="block text-sm font-medium">Banner image
              <select value={form.imageKey} onChange={(event) => setForm({ ...form, imageKey: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                {imageOptions.map((image) => <option key={image.value} value={image.value}>{image.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Display this banner immediately</label>
            <button disabled={saveMutation.isPending} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400">
              {editingIndex === null ? <Plus size={18} /> : <Save size={18} />}{saveMutation.isPending ? "Saving…" : editingIndex === null ? "Add banner" : "Save changes"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
