import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { Product, Category } from '../../types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '../../components/LoadingState';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Plus,
  ArrowLeft,
  Package,
  Pencil,
  Trash2,
  RotateCcw,
  Upload,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Panel = 'list' | 'create' | 'edit' | 'upload_image';

const STATUS_STYLES = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
};

const resolveProductImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activePanel, setActivePanel] = useState<Panel>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    isActive: true,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const [prodRes, catRes] = await Promise.all([
        adminApi.getAdminProducts(),
        adminApi.getCategories(),
      ]);
      if (prodRes.success && prodRes.data?.products) setProducts(prodRes.data.products);
      if (catRes.success && catRes.data) setCategories(catRes.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      isActive: true,
    });
    setFormError(null);
    setSuccessMsg(null);
    setSelectedFiles([]);
    setImagePreviews([]);
  };

  const handleOpenCreate = () => { resetForm(); setActivePanel('create'); };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price != null ? String(product.price) : '',
      stock: product.stock != null ? String(product.stock) : '',
      categoryId: product.categoryId ?? '',
      isActive: Boolean(product.isActive),
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setFormError(null);
    setSuccessMsg(null);
    setActivePanel('edit');
  };

  const handleOpenUpload = (product: Product) => {
    setSelectedProduct(product);
    setSelectedFiles([]);
    setImagePreviews([]);
    setFormError(null); setSuccessMsg(null);
    setActivePanel('upload_image');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNumber = Number(form.price);
    const stockNumber = Number(form.stock);

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }

    if (!form.price.trim()) {
      setFormError("Price is required.");
      return;
    }

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setFormError("Price must be a valid number greater than 0.");
      return;
    }

    if (!form.stock.trim()) {
      setFormError("Stock is required.");
      return;
    }

    if (
      Number.isNaN(stockNumber) ||
      !Number.isInteger(stockNumber) ||
      stockNumber < 0
    ) {
      setFormError("Stock must be a valid whole number 0 or more.");
      return;
    }

    if (!form.categoryId) {
      setFormError("Category is required.");
      return;
    }

    // File validation check
    if (selectedFiles.length > 4) {
      setFormError('Maximum of 4 product images is permitted.');
      return;
    }
    for (const file of selectedFiles) {
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        setFormError('Invalid file type. Only JPG, PNG, WEBP are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFormError('File size exceeds 2MB limit per image.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.createProduct({
        name: form.name,
        description: form.description,
        price: priceNumber,
        stock: stockNumber,
        categoryId: form.categoryId,
        isActive: form.isActive
      });
      if (res.success && res.data) {
        const createdProduct = res.data;
        if (selectedFiles.length > 0) {
          try {
            await adminApi.uploadProductImages(createdProduct.id, selectedFiles);
          } catch (uploadErr: any) {
            setFormError(`Product created but images upload failed: ${uploadErr.message}`);
            await loadData();
            return;
          }
        }
        setSuccessMsg(`Product "${form.name}" created successfully.`);
        await loadData();
        setActivePanel('list');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setFormError(null);

    const priceNumber = Number(form.price);
    const stockNumber = Number(form.stock);

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }

    if (!form.price.trim()) {
      setFormError("Price is required.");
      return;
    }

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setFormError("Price must be a valid number greater than 0.");
      return;
    }

    if (!form.stock.trim()) {
      setFormError("Stock is required.");
      return;
    }

    if (
      Number.isNaN(stockNumber) ||
      !Number.isInteger(stockNumber) ||
      stockNumber < 0
    ) {
      setFormError("Stock must be a valid whole number 0 or more.");
      return;
    }

    if (!form.categoryId) {
      setFormError("Category is required.");
      return;
    }

    // File validation check
    if (selectedFiles.length > 4) {
      setFormError('Maximum of 4 product images is permitted.');
      return;
    }
    for (const file of selectedFiles) {
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        setFormError('Invalid file type. Only JPG, PNG, WEBP are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFormError('File size exceeds 2MB limit per image.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.updateProduct(selectedProduct.id, {
        name: form.name,
        description: form.description,
        price: priceNumber,
        stock: stockNumber,
        categoryId: form.categoryId,
        isActive: form.isActive
      });
      if (res.success) {
        if (selectedFiles.length > 0) {
          try {
            await adminApi.uploadProductImages(selectedProduct.id, selectedFiles);
          } catch (uploadErr: any) {
            setFormError(`Product details saved but images upload failed: ${uploadErr.message}`);
            await loadData();
            return;
          }
        }
        setSuccessMsg(`Product "${form.name}" updated successfully.`);
        await loadData();
        setActivePanel('list');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (product: Product) => {
    const action = product.isActive ? 'deactivate' : 'restore';
    if (!window.confirm(`${action === 'deactivate' ? 'Deactivate' : 'Restore'} product "${product.name}"?`)) return;
    try {
      setIsLoading(true);
      if (product.isActive) {
        await adminApi.deleteProduct(product.id);
      } else {
        await adminApi.updateProduct(product.id, { isActive: true });
      }
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Operation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || selectedFiles.length === 0) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await adminApi.uploadProductImages(selectedProduct.id, selectedFiles);
      if (res.success) {
        setSuccessMsg('Images uploaded successfully.');
        await loadData();
        setActivePanel('list');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Image upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (incomingFiles.length === 0) return;

    const existingCount = (activePanel === 'edit' || activePanel === 'upload_image') && selectedProduct?.images ? selectedProduct.images.length : 0;
    const remainingSlots = 4 - existingCount - selectedFiles.length;

    if (incomingFiles.length > remainingSlots) {
      setFormError(`Maximum 4 images per product. This product already has ${existingCount} image${existingCount !== 1 ? 's' : ''} and ${selectedFiles.length} newly selected. You can only select ${remainingSlots} more.`);
      e.target.value = ''; // Reset file input element
      return;
    }

    setFormError(null);
    const newFiles = [...selectedFiles, ...incomingFiles];
    setSelectedFiles(newFiles);

    // Generate previews for the new files
    const newPreviews: string[] = [];
    let loadedCount = 0;

    incomingFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === incomingFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ''; // Reset file input element so user can choose more files later
  };

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    if (!selectedProduct) return;
    if (!window.confirm('Are you sure you want to delete this product image?')) return;

    try {
      setIsSubmitting(true);
      setFormError(null);
      const res = await adminApi.products.deleteProductImage(selectedProduct.id, imageId);
      if (res.success && res.data) {
        setSelectedProduct(res.data);
        setProducts((prev) =>
          prev.map((p) => (p.id === res.data.id ? res.data : p))
        );
        setSuccessMsg('Product image deleted successfully.');
        await loadData();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to delete product image.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name || '—';

  // ProductForm is now a stable standalone component defined outside AdminProductsPage

  if (isLoading && products.length === 0) {
    return <LoadingState message="Loading product catalog..." className="py-24" />;
  }

  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-0">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Management</h1>
        {activePanel === 'list' && (
          <Button
            onClick={handleOpenCreate}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 shadow-sm shadow-orange-500/20 rounded-xl px-5"
          >
            <Plus className="w-4.5 h-4.5" /> Add Product
          </Button>
        )}
        {activePanel !== 'list' && (
          <Button
            variant="outline"
            onClick={() => setActivePanel('list')}
            className="gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Button>
        )}
      </div>

      {/* Global alerts */}
      {errorMsg && activePanel === 'list' && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {successMsg && activePanel === 'list' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* ─── PANEL: LIST ─── */}
      {activePanel === 'list' && (
        <Card className="border border-slate-200/85 rounded-2xl shadow-sm overflow-hidden bg-white">
          {/* Desktop table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
            <div className="col-span-1">Image</div>
            <div className="col-span-3">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1.5 text-right">Price</div>
            <div className="col-span-1.5 text-center">Stock</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">No products in catalog yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">Get started by creating a new database record</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 rounded-xl font-bold">
                  <Plus className="w-4 h-4" /> Add First Product
                </Button>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenUpload(product)}
                        className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden hover:border-orange-300 transition-colors"
                        title="Upload image"
                      >
                        {product.imageUrl ? (
                          <img src={resolveProductImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImagePlus className="w-5 h-5 text-gray-300" strokeWidth={1.25} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{formatCurrency(product.price)}</span>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                              product.isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive
                            )}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(product)} className="gap-1 font-medium flex-1">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(product)}
                        className={cn('gap-1 font-medium flex-1', product.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-700 border-green-200 hover:bg-green-50')}
                      >
                        {product.isActive ? <><Trash2 className="w-3.5 h-3.5" /> Deactivate</> : <><RotateCcw className="w-3.5 h-3.5" /> Restore</>}
                      </Button>
                    </div>
                  </div>

                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <button
                        onClick={() => handleOpenUpload(product)}
                        className="w-10 h-10 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center overflow-hidden hover:border-orange-300 transition-all shadow-sm shrink-0"
                        title="Upload image"
                      >
                        {product.imageUrl ? (
                          <img src={resolveProductImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <ImagePlus className="w-4.5 h-4.5 text-slate-350" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-bold text-slate-900 leading-snug">{product.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {product.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold">
                        <Tag className="w-3 h-3 text-slate-400" strokeWidth={2} />
                        {getCategoryName(product.categoryId)}
                      </span>
                    </div>
                    <div className="col-span-1.5 text-right font-extrabold text-slate-900 text-sm whitespace-nowrap">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="col-span-1.5 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono',
                          product.stock > 10 ? 'bg-green-50 text-green-700 border-green-200/40'
                            : product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200/40'
                            : 'bg-red-50 text-red-700 border-red-200/40'
                        )}
                      >
                        {product.stock} items
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border',
                          product.isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive
                        )}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(product)} className="gap-1 font-semibold text-xs rounded-xl border-slate-200 py-1.5 px-3">
                        <Pencil className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(product)}
                        className={cn('gap-1 font-semibold text-xs rounded-xl py-1.5 px-3 transition-all shrink-0', product.isActive ? 'text-red-650 border-red-200 hover:bg-red-50/50' : 'text-green-700 border-green-200 hover:bg-green-50/50')}
                      >
                        {product.isActive ? <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> : <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />}
                        {product.isActive ? 'Deactivate' : 'Restore'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ─── PANEL: CREATE ─── */}
      {activePanel === 'create' && (
        <Card className="border border-slate-200/85 rounded-2xl shadow-sm bg-white">
          <CardHeader className="pb-3 px-6 pt-5">
            <CardTitle className="text-base font-bold text-slate-800">New Product</CardTitle>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardBody className="p-6">
            <ProductForm
              onSubmit={handleCreateSubmit}
              submitLabel="Create Product"
              form={form}
              onChange={handleFormChange}
              onCheckboxChange={handleCheckboxChange}
              categories={categories}
              formError={formError}
              isSubmitting={isSubmitting}
              activePanel={activePanel}
              selectedProduct={selectedProduct}
              selectedFiles={selectedFiles}
              imagePreviews={imagePreviews}
              handleFileChange={handleFileChange}
              handleRemoveNewFile={handleRemoveNewFile}
              handleDeleteExistingImage={handleDeleteExistingImage}
              resolveProductImageUrl={resolveProductImageUrl}
              onCancel={() => setActivePanel('list')}
            />
          </CardBody>
        </Card>
      )}

      {/* ─── PANEL: EDIT ─── */}
      {activePanel === 'edit' && selectedProduct && (
        <Card className="border border-slate-200/85 rounded-2xl shadow-sm bg-white">
          <CardHeader className="pb-3 px-6 pt-5">
            <CardTitle className="text-base font-bold text-slate-800">Edit Product</CardTitle>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardBody className="p-6">
            <ProductForm
              onSubmit={handleEditSubmit}
              submitLabel="Save Changes"
              form={form}
              onChange={handleFormChange}
              onCheckboxChange={handleCheckboxChange}
              categories={categories}
              formError={formError}
              isSubmitting={isSubmitting}
              activePanel={activePanel}
              selectedProduct={selectedProduct}
              selectedFiles={selectedFiles}
              imagePreviews={imagePreviews}
              handleFileChange={handleFileChange}
              handleRemoveNewFile={handleRemoveNewFile}
              handleDeleteExistingImage={handleDeleteExistingImage}
              resolveProductImageUrl={resolveProductImageUrl}
              onCancel={() => setActivePanel('list')}
            />
          </CardBody>
        </Card>
      )}

      {/* ─── PANEL: UPLOAD IMAGE ─── */}
      {activePanel === 'upload_image' && selectedProduct && (
        <Card className="border border-slate-200/85 rounded-2xl shadow-sm bg-white">
          <CardHeader className="pb-3 px-6 pt-5">
            <CardTitle className="text-base font-bold text-slate-800">Upload Product Image</CardTitle>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardBody className="p-6 space-y-5 max-w-md">
            {/* Product info */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 bg-white border border-slate-200/50 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-slate-400" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedProduct.name}</p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {selectedProduct.id}</p>
              </div>
            </div>

            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Existing Images Gallery */}
            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Product Gallery</p>
                <div className="flex flex-wrap gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {selectedProduct.images.map((img, idx) => (
                    <div key={img.id} className="relative w-20 h-20 shrink-0 mt-1 mr-1">
                      <div className="w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
                        <img src={resolveProductImageUrl(img.url)} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 ? (
                          <span className="absolute bottom-0 inset-x-0 bg-orange-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-0.5 text-center select-none shadow-sm z-0">
                            Cover
                          </span>
                        ) : (
                          <span className="absolute bottom-0 inset-x-0 bg-slate-800/80 text-white font-extrabold text-[8px] py-0.5 text-center select-none z-0">
                            #{idx + 1}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-red-200 text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center z-10"
                        aria-label="Remove image"
                        title="Delete image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previews Row */}
            {imagePreviews.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Newly Selected Images (Pending Upload)</p>
                <div className="flex flex-wrap gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {imagePreviews.map((url, idx) => {
                    const existingCount = selectedProduct.images ? selectedProduct.images.length : 0;
                    const isCover = existingCount === 0 && idx === 0;
                    return (
                      <div key={idx} className="relative w-20 h-20 shrink-0 mt-1 mr-1">
                        <div className="w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
                          <img src={resolveProductImageUrl(url)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          {isCover ? (
                            <span className="absolute bottom-0 inset-x-0 bg-orange-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-0.5 text-center select-none shadow-sm z-0">
                              Cover
                            </span>
                          ) : (
                            <span className="absolute bottom-0 inset-x-0 bg-slate-800/80 text-white font-extrabold text-[8px] py-0.5 text-center select-none z-0">
                              Pending #{existingCount + idx + 1}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-red-200 text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center z-10"
                          aria-label="Remove image"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Select Image Files <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {(selectedProduct.images ? selectedProduct.images.length : 0) + selectedFiles.length} of 4 images used. You can add {4 - (selectedProduct.images ? selectedProduct.images.length : 0) - selectedFiles.length} more.
                  </span>
                </div>
                
                {((selectedProduct.images ? selectedProduct.images.length : 0) + selectedFiles.length) < 4 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-orange-355 hover:bg-slate-50/50 transition-all cursor-pointer relative">
                    <Upload className="w-8 h-8 text-gray-300" strokeWidth={1.25} />
                    <p className="text-xs text-slate-400 text-center font-medium">PNG, JPG, JPEG, WEBP — upload up to 4, max 2 MB each</p>
                    <input
                      type="file"
                      name="image"
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      required={selectedFiles.length === 0}
                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-colors"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-xs font-bold text-amber-800">
                      Maximum 4 images reached. Delete existing images to upload new ones.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || selectedFiles.length === 0}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 shadow-sm rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" strokeWidth={1.75} />}
                  {selectedProduct.images && selectedProduct.images.length > 0 ? 'Add Images' : 'Upload Images'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setActivePanel('list')} className="gap-1.5 font-medium rounded-xl">
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

    </div>
  );
};

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  form: {
    name: string;
    description: string;
    price: string;
    stock: string;
    categoryId: string;
    isActive: boolean;
  };
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  categories: Category[];
  formError: string | null;
  isSubmitting: boolean;
  activePanel: Panel;
  selectedProduct: Product | null;
  selectedFiles: File[];
  imagePreviews: string[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveNewFile: (index: number) => void;
  handleDeleteExistingImage: (imageId: string) => void;
  resolveProductImageUrl: (url?: string | null) => string;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  submitLabel,
  form,
  onChange,
  onCheckboxChange,
  categories,
  formError,
  isSubmitting,
  activePanel,
  selectedProduct,
  selectedFiles,
  imagePreviews,
  handleFileChange,
  handleRemoveNewFile,
  handleDeleteExistingImage,
  resolveProductImageUrl,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="prod-name" className="text-xs font-semibold uppercase tracking-wider">
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="prod-name"
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          placeholder="e.g. Mechanical Keyboard"
          autoComplete="off"
          className="bg-gray-50 border-gray-200 focus:border-orange-400"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider">Description</Label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Short product description..."
          autoComplete="off"
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-500/10 placeholder:text-gray-400 min-h-[90px] resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="prod-price" className="text-xs font-semibold uppercase tracking-wider">
            Price (RM) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="prod-price"
            name="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={onChange}
            placeholder="e.g. 1200.00"
            autoComplete="off"
            className="bg-gray-50 border-gray-200 focus:border-orange-400"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prod-stock" className="text-xs font-semibold uppercase tracking-wider">
            Stock <span className="text-red-500">*</span>
          </Label>
          <Input
            id="prod-stock"
            name="stock"
            type="text"
            inputMode="numeric"
            value={form.stock}
            onChange={onChange}
            placeholder="e.g. 10"
            autoComplete="off"
            className="bg-gray-50 border-gray-200 focus:border-orange-400"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prod-category" className="text-xs font-semibold uppercase tracking-wider">
          Category <span className="text-red-500">*</span>
        </Label>
        <select
          id="prod-category"
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-500/10"
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 py-1">
        <input
          type="checkbox"
          id="prod-active"
          name="isActive"
          checked={form.isActive}
          onChange={onCheckboxChange}
          className="w-4 h-4 rounded border-gray-300 accent-orange-600"
        />
        <label htmlFor="prod-active" className="text-sm font-medium text-gray-700">
          Product is active (visible to customers)
        </label>
      </div>

      {/* Product Image Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product Images</Label>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {((activePanel === 'edit' && selectedProduct?.images) ? selectedProduct.images.length : 0) + selectedFiles.length} of 4 images used. You can add {4 - ((activePanel === 'edit' && selectedProduct?.images) ? selectedProduct.images.length : 0) - selectedFiles.length} more.
          </span>
        </div>
        
        {/* Existing Images Gallery */}
        {activePanel === 'edit' && selectedProduct?.images && selectedProduct.images.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Product Gallery</p>
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              {selectedProduct.images.map((img, idx) => (
                <div key={img.id} className="relative w-20 h-20 shrink-0 mt-1 mr-1">
                  <div className="w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
                    <img src={resolveProductImageUrl(img.url)} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 ? (
                      <span className="absolute bottom-0 inset-x-0 bg-orange-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-0.5 text-center select-none shadow-sm z-0">
                        Cover
                      </span>
                    ) : (
                      <span className="absolute bottom-0 inset-x-0 bg-slate-800/80 text-white font-extrabold text-[8px] py-0.5 text-center select-none z-0">
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-red-200 text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center z-10"
                    aria-label="Remove image"
                    title="Delete image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previews Row */}
        {imagePreviews.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Newly Selected Images (Pending Save)</p>
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              {imagePreviews.map((url, idx) => {
                const existingCount = (activePanel === 'edit' && selectedProduct?.images) ? selectedProduct.images.length : 0;
                const isCover = existingCount === 0 && idx === 0;
                return (
                  <div key={idx} className="relative w-20 h-20 shrink-0 mt-1 mr-1">
                    <div className="w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
                      <img src={resolveProductImageUrl(url)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      {isCover ? (
                        <span className="absolute bottom-0 inset-x-0 bg-orange-600 text-white font-extrabold text-[8px] uppercase tracking-wider py-0.5 text-center select-none shadow-sm z-0">
                          Cover
                        </span>
                      ) : (
                        <span className="absolute bottom-0 inset-x-0 bg-slate-800/80 text-white font-extrabold text-[8px] py-0.5 text-center select-none z-0">
                          Pending #{existingCount + idx + 1}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-red-200 text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center z-10"
                      aria-label="Remove image"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Selection and Helper Area */}
        {(((activePanel === 'edit' && selectedProduct?.images) ? selectedProduct.images.length : 0) + selectedFiles.length) < 4 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {imagePreviews.length === 0 && (!selectedProduct?.images || selectedProduct.images.length === 0) && (
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                <ImagePlus className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
              </div>
            )}
            <div className="space-y-1.5 flex-1 min-w-0">
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-colors cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                Upload up to 4 images. First image will be used as the product cover.<br />
                Allowed: JPG, PNG, WEBP. Max 2MB per image.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800">
              Maximum 4 images per product reached. Delete existing images to free up slots.
            </p>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-2"
        >
          {isSubmitting ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <CheckCircle2 className="w-4.5 h-4.5" strokeWidth={1.75} />}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="gap-1.5 font-medium"
        >
          <X className="w-4 h-4" /> Cancel
        </Button>
      </div>
    </form>
  );
};

export default AdminProductsPage;
