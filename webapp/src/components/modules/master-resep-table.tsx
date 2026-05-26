'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useRecipes,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
} from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { formatCurrency } from '@/lib/utils';
import type { Recipe } from '@bakersgo/types';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  description: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string().min(1, 'Pilih bahan'),
        amount: z.coerce.number().positive('Jumlah harus > 0'),
      }),
    )
    .min(1, 'Minimal 1 bahan diperlukan'),
});

type FormValues = z.infer<typeof schema>;

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';

function RecipeModal({
  recipe,
  onClose,
}: {
  recipe: Recipe | null;
  onClose: () => void;
}) {
  const create = useCreateRecipe();
  const update = useUpdateRecipe();
  const { data: ingredientsData } = useIngredients();
  const ingredientList = ingredientsData?.data ?? [];
  const isEdit = recipe !== null;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: recipe
      ? {
          name: recipe.name,
          description: recipe.description ?? '',
          ingredients: recipe.ingredients.map((ri) => ({
            ingredientId: ri.ingredientId,
            amount: ri.amount,
          })),
        }
      : {
          ingredients: [{ ingredientId: '', amount: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });
  const watchedIngredients = watch('ingredients');

  const totalCost = watchedIngredients.reduce((sum, row) => {
    const ing = ingredientList.find((i) => i.id === row.ingredientId);
    if (!ing || !row.amount) return sum;
    return sum + ing.pricePerUnit * row.amount;
  }, 0);

  async function onSubmit(values: FormValues) {
    const dto = { ...values, batchSize: 1, batchUnit: 'pcs' };
    if (isEdit) {
      await update.mutateAsync({ id: recipe!.id, dto });
    } else {
      await create.mutateAsync(dto);
    }
    onClose();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ingredientsError = (errors.ingredients as any)?.message as string | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-background shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Resep' : 'Tambah Resep'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4">
          {/* Nama Resep */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nama Resep</label>
            <input
              {...register('name')}
              className={fieldCls}
              placeholder="cth: Roti Tawar Original"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Deskripsi{' '}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </label>
            <input
              {...register('description')}
              className={fieldCls}
              placeholder="cth: Resep standar untuk 1 loyang"
            />
          </div>

          {/* Komposisi Bahan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Komposisi Bahan</label>
              <button
                type="button"
                onClick={() => append({ ingredientId: '', amount: 0 })}
                className="flex items-center gap-1 text-xs text-[#A0813A] hover:opacity-75 transition-opacity"
              >
                <Plus size={12} />
                Tambah Bahan
              </button>
            </div>

            {ingredientsError && (
              <p className="mb-2 text-xs text-destructive">{ingredientsError}</p>
            )}

            <div className="space-y-2">
              {fields.map((field, index) => {
                const selectedIng = ingredientList.find(
                  (i) => i.id === watchedIngredients[index]?.ingredientId,
                );
                const subtotal =
                  selectedIng && watchedIngredients[index]?.amount
                    ? selectedIng.pricePerUnit * watchedIngredients[index].amount
                    : 0;

                return (
                  <div key={field.id} className="flex gap-2 items-start">
                    {/* Ingredient selector */}
                    <div className="flex-1 relative">
                      <select
                        {...register(`ingredients.${index}.ingredientId`)}
                        className={`${fieldCls} appearance-none pr-9 cursor-pointer`}
                      >
                        <option value="">Pilih bahan...</option>
                        {ingredientList.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]"
                      />
                      {errors.ingredients?.[index]?.ingredientId && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.ingredients[index]?.ingredientId?.message}
                        </p>
                      )}
                    </div>

                    {/* Amount input */}
                    <div className="w-28 shrink-0">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`ingredients.${index}.amount`)}
                        className={fieldCls}
                        placeholder="Jml"
                      />
                      {subtotal > 0 && (
                        <p className="mt-0.5 text-xs text-[#A0813A] text-right">
                          {formatCurrency(subtotal)}
                        </p>
                      )}
                      {errors.ingredients?.[index]?.amount && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.ingredients[index]?.amount?.message}
                        </p>
                      )}
                    </div>

                    {/* Remove row */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-2.5 p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}

              {fields.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3 border border-dashed border-border rounded-xl">
                  Belum ada bahan. Klik &quot;Tambah Bahan&quot; di atas.
                </p>
              )}
            </div>
          </div>

          {/* Total cost preview */}
          <div className="rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#A0813A]">Total Biaya Dasar</span>
            <span className="text-sm font-semibold text-[#A0813A]">
              {formatCurrency(totalCost)}
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Hapus Resep</h2>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus{' '}
          <span className="font-medium text-foreground">{name}</span>? Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export function MasterResepTable() {
  const { data, isLoading, error } = useRecipes();
  const deleteRecipe = useDeleteRecipe();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState<Recipe | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(recipe: Recipe) {
    setEditing(recipe);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteRecipe.mutateAsync(deleting.id);
    setDeleting(null);
  }

  const recipes = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Memuat...' : `${recipes.length} resep terdaftar`}
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <Plus size={14} />
          Tambah Resep
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gagal memuat data. Pastikan Anda sudah login.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Nama Resep
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Ukuran Batch
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                Biaya Dasar
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                Jumlah Bahan
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Memuat data...
                </td>
              </tr>
            ) : recipes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Belum ada resep. Klik &quot;Tambah Resep&quot; untuk memulai.
                </td>
              </tr>
            ) : (
              recipes.map((recipe) => (
                <tr
                  key={recipe.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{recipe.name}</div>
                    {recipe.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {recipe.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {recipe.batchSize.toLocaleString('id-ID', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {recipe.batchUnit}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#A0813A]">
                    {formatCurrency(recipe.baseRecipeCost)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {recipe.ingredients.length} bahan
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(recipe)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleting(recipe)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && <RecipeModal recipe={editing} onClose={closeModal} />}
      {deleting && (
        <DeleteConfirm
          name={deleting.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
