"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input } from "@/components/ui";
import {
  updateUnitForms,
  createUnit,
  deleteUnit,
  changePasswordAction,
  changeUsernameAction,
  revokeDeviceAction,
  exportRecipesCSV,
  importRecipesCSV,
  logoutAction,
  createStore,
  deleteStore,
} from "./actions";

type Tab = "units" | "stores" | "import" | "export" | "account";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} size="md">
      {children}
    </Button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("units");
  const [units, setUnits] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    imported?: number;
    errors?: string[];
    message?: string;
  } | null>(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [passwordState, passwordAction] = useActionState(
    changePasswordAction,
    null
  );
  const [usernameState, usernameAction] = useActionState(
    changeUsernameAction,
    null
  );

  // Charger les données au montage
  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setUnits(data.units || []);
      setStores(data.stores || []);
      setDevices(data.devices || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleExport = async () => {
    const csv = await exportRecipesCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `recettes-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("csvFile") as File;

    if (!file) {
      setImportStatus({
        success: false,
        message: "Veuillez sélectionner un fichier",
      });
      return;
    }

    const content = await file.text();
    const result = await importRecipesCSV(content);
    setImportStatus(result);

    if (result.success) {
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleUnitUpdate = async (
    code: string,
    singularForm: string,
    pluralForm: string
  ) => {
    await updateUnitForms(code, singularForm, pluralForm);
    // Recharger les unités
    const res = await fetch("/api/settings");
    const data = await res.json();
    setUnits(data.units || []);
  };

  const handleRevokeDevice = async (deviceId: number) => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir révoquer cet appareil ? Toutes ses sessions seront supprimées."
      )
    ) {
      await revokeDeviceAction(deviceId);
      const res = await fetch("/api/settings");
      const data = await res.json();
      setDevices(data.devices || []);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleCreateUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;
    const type = formData.get("type") as string;
    const ratioToBase = parseFloat(formData.get("ratioToBase") as string);
    const singularForm = formData.get("singularForm") as string;
    const pluralForm = formData.get("pluralForm") as string;
    const gender = formData.get("gender") as string;

    const result = await createUnit(
      code,
      type,
      ratioToBase,
      singularForm,
      pluralForm,
      gender
    );

    if (result.success) {
      setShowAddUnitModal(false);
      const res = await fetch("/api/settings");
      const data = await res.json();
      setUnits(data.units || []);
      (e.target as HTMLFormElement).reset();
    } else {
      alert(result.error || "Erreur lors de la création de l'unité");
    }
  };

  const handleDeleteUnit = async (code: string) => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer cette unité ? Cette action est irréversible."
      )
    ) {
      const result = await deleteUnit(code);
      if (result.success) {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setUnits(data.units || []);
      } else {
        alert(result.error || "Erreur lors de la suppression");
      }
    }
  };

  const handleCreateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    const result = await createStore(name);

    if (result.success) {
      setShowAddStoreModal(false);
      const res = await fetch("/api/settings");
      const data = await res.json();
      setStores(data.stores || []);
      (e.target as HTMLFormElement).reset();
    } else {
      alert(result.error || "Erreur lors de la création du magasin");
    }
  };

  const handleDeleteStore = async (id: number) => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer ce magasin ? Cette action est irréversible."
      )
    ) {
      const result = await deleteStore(id);
      if (result.success) {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setStores(data.stores || []);
      } else {
        alert(result.error || "Erreur lors de la suppression");
      }
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "units", label: "Unités", icon: "📏" },
    { id: "stores", label: "Magasins", icon: "🏪" },
    { id: "import", label: "Import", icon: "📥" },
    { id: "export", label: "Export", icon: "📤" },
    { id: "account", label: "Compte", icon: "👤" },
  ];

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#e6edf3]">
          Paramètres
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-[#30363d] overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1 sm:gap-2
                ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-[#e6edf3] hover:border-gray-300 dark:hover:border-[#484f59]"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === "units" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-2">
                  Gestion des unités
                </h2>
                <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                  Modifiez les formes singulières et plurielles des unités pour
                  un affichage correct.
                </p>
              </div>
              <Button
                onClick={() => setShowAddUnitModal(true)}
                variant="primary"
                size="md"
              >
                Ajouter une unité
              </Button>
            </div>

            {/* Modal Ajouter une unité */}
            {showAddUnitModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-4">
                    Ajouter une nouvelle unité
                  </h3>
                  <form onSubmit={handleCreateUnit} className="space-y-4">
                    <Input
                      name="code"
                      label="Code"
                      placeholder="Ex: kg, L, unite"
                      required
                      fullWidth
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg text-gray-900 dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="mass">Masse (mass)</option>
                        <option value="volume">Volume (volume)</option>
                        <option value="count">Quantité (count)</option>
                      </select>
                    </div>
                    <Input
                      name="ratioToBase"
                      label="Ratio vers l'unité de base"
                      type="number"
                      step="0.001"
                      placeholder="Ex: 1000 pour kg vers g"
                      required
                      fullWidth
                    />
                    <Input
                      name="singularForm"
                      label="Forme singulière"
                      placeholder="Ex: pièce"
                      required
                      fullWidth
                    />
                    <Input
                      name="pluralForm"
                      label="Forme plurielle"
                      placeholder="Ex: pièces"
                      required
                      fullWidth
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1">
                        Genre
                      </label>
                      <select
                        name="gender"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg text-gray-900 dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="m">Masculin (m)</option>
                        <option value="f">Féminin (f)</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => setShowAddUnitModal(false)}
                        variant="secondary"
                        size="md"
                      >
                        Annuler
                      </Button>
                      <Button type="submit" variant="primary" size="md">
                        Créer l'unité
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-gray-600 dark:text-[#8b949e]">
                Chargement...
              </p>
            ) : (
              <div className="space-y-4">
                {units.map((unit) => (
                  <div
                    key={unit.code}
                    className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1">
                          Code
                        </label>
                        <div className="px-3 py-2 bg-gray-50 dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg text-gray-500 dark:text-[#8b949e]">
                          {unit.code}
                        </div>
                      </div>
                      <Input
                        name="singularForm"
                        label="Forme singulière"
                        defaultValue={unit.singularForm || ""}
                        placeholder="Ex: pièce"
                        id={`singular-${unit.code}`}
                      />
                      <Input
                        name="pluralForm"
                        label="Forme plurielle"
                        defaultValue={unit.pluralForm || ""}
                        placeholder="Ex: pièces"
                        id={`plural-${unit.code}`}
                      />
                      <Button
                        onClick={() => {
                          const singular = (
                            document.getElementById(
                              `singular-${unit.code}`
                            ) as HTMLInputElement
                          ).value;
                          const plural = (
                            document.getElementById(
                              `plural-${unit.code}`
                            ) as HTMLInputElement
                          ).value;
                          handleUnitUpdate(unit.code, singular, plural);
                        }}
                        variant="primary"
                        size="md"
                      >
                        Mettre à jour
                      </Button>
                      <Button
                        onClick={() => handleDeleteUnit(unit.code)}
                        variant="danger"
                        size="md"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stores" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-2">
                  Gestion des magasins
                </h2>
                <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                  Personnalisez la liste des magasins disponibles pour vos ingrédients.
                </p>
              </div>
              <Button
                onClick={() => setShowAddStoreModal(true)}
                variant="primary"
                size="md"
              >
                Ajouter un magasin
              </Button>
            </div>

            {/* Modal Ajouter un magasin */}
            {showAddStoreModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-4">
                    Ajouter un nouveau magasin
                  </h3>
                  <form onSubmit={handleCreateStore} className="space-y-4">
                    <Input
                      name="name"
                      label="Nom du magasin"
                      placeholder="Ex: Monoprix"
                      required
                      fullWidth
                    />
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => setShowAddStoreModal(false)}
                        variant="secondary"
                        size="md"
                      >
                        Annuler
                      </Button>
                      <Button type="submit" variant="primary" size="md">
                        Créer le magasin
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-gray-600 dark:text-[#8b949e]">
                Chargement...
              </p>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏪</span>
                      <span className="font-medium text-gray-900 dark:text-[#e6edf3]">
                        {store.name}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDeleteStore(store.id)}
                      variant="danger"
                      size="sm"
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
                {stores.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-[#8b949e] py-8">
                    Aucun magasin configuré. Ajoutez-en un pour commencer !
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "import" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-2">
                Import de recettes
              </h2>
              <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                Importez plusieurs recettes à la fois via un fichier CSV.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Format attendu
              </p>
              <code className="text-xs text-blue-800 dark:text-blue-300 block bg-blue-100 dark:bg-blue-900/40 p-3 rounded overflow-x-auto">
                titre,description,prepMin,cookMin,servingsDefault,tags,ingredients,steps
              </code>
              <ul className="mt-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li>
                  • <strong>tags</strong> : JSON array, ex:{" "}
                  {`["dessert","rapide"]`}
                </li>
                <li>
                  • <strong>ingredients</strong> : JSON array avec name,
                  qtyPerPerson, unit, storeSection, storeName
                </li>
                <li>
                  • <strong>steps</strong> : JSON array de strings
                </li>
              </ul>
            </div>

            {importStatus && (
              <div
                className={`border rounded-lg p-4 ${
                  importStatus.success
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                <p className="font-medium">
                  {importStatus.success
                    ? `✅ ${importStatus.imported} recette(s) importée(s)`
                    : `❌ ${importStatus.message || "Erreur lors de l'import"}`}
                </p>
                {importStatus.errors && importStatus.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      Voir les erreurs ({importStatus.errors.length})
                    </summary>
                    <ul className="mt-2 text-xs space-y-1 ml-4 list-disc">
                      {importStatus.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-2">
                  Fichier CSV
                </label>
                <input
                  type="file"
                  name="csvFile"
                  accept=".csv"
                  className="block w-full text-sm text-gray-900 dark:text-[#e6edf3] border border-gray-300 dark:border-[#30363d] rounded-lg cursor-pointer bg-gray-50 dark:bg-[#1c2128] focus:outline-none"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Importer les recettes
              </Button>
            </form>
          </div>
        )}

        {activeTab === "export" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-2">
                Export de recettes
              </h2>
              <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                Téléchargez toutes vos recettes au format CSV.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-6">
              <p className="text-sm text-gray-700 dark:text-[#8b949e] mb-4">
                Le fichier exporté contiendra toutes vos recettes avec leurs
                ingrédients, étapes et métadonnées au format CSV.
              </p>
              <Button onClick={handleExport} variant="primary" size="lg">
                📥 Télécharger l'export CSV
              </Button>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-8">
            {/* Change Username */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-2">
                Changer le nom d'utilisateur
              </h2>
              <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-4">
                Modifiez votre nom d'utilisateur pour la connexion.
              </p>

              {usernameState?.success && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{usernameState.message}</p>
                </div>
              )}

              {usernameState?.error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{usernameState.error}</p>
                </div>
              )}

              <div className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-6">
                <form action={usernameAction} className="space-y-4 max-w-md">
                  <Input
                    name="newUsername"
                    type="text"
                    label="Nouveau nom d'utilisateur"
                    required
                    fullWidth
                    autoComplete="username"
                  />
                  <Input
                    name="password"
                    type="password"
                    label="Mot de passe (pour confirmer)"
                    required
                    fullWidth
                    autoComplete="current-password"
                  />
                  <SubmitButton>Changer le nom d'utilisateur</SubmitButton>
                </form>
              </div>
            </div>

            {/* Change Password */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-2">
                Changer le mot de passe
              </h2>
              <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-4">
                Modifiez votre mot de passe de connexion.
              </p>

              {passwordState?.success && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{passwordState.message}</p>
                </div>
              )}

              {passwordState?.error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{passwordState.error}</p>
                </div>
              )}

              <div className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-6">
                <form action={passwordAction} className="space-y-4 max-w-md">
                  <Input
                    name="oldPassword"
                    type="password"
                    label="Mot de passe actuel"
                    required
                    fullWidth
                    autoComplete="current-password"
                  />
                  <Input
                    name="newPassword"
                    type="password"
                    label="Nouveau mot de passe"
                    required
                    fullWidth
                    autoComplete="new-password"
                  />
                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirmer le nouveau mot de passe"
                    required
                    fullWidth
                    autoComplete="new-password"
                  />
                  <SubmitButton>Changer le mot de passe</SubmitButton>
                </form>
              </div>
            </div>

            {/* Devices */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#e6edf3] mb-2">
                Appareils connectés
              </h2>
              <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-4">
                Gérez les appareils autorisés à accéder à votre compte.
              </p>

              {loading ? (
                <p className="text-gray-600 dark:text-[#8b949e]">
                  Chargement...
                </p>
              ) : devices.length === 0 ? (
                <p className="text-gray-600 dark:text-[#8b949e]">
                  Aucun appareil enregistré
                </p>
              ) : (
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-[#30363d] rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#e6edf3]">
                          {device.deviceName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                          Dernière connexion :{" "}
                          {new Date(device.lastSeenAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRevokeDevice(device.id)}
                        variant="danger"
                        size="sm"
                      >
                        Révoquer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="pt-6 border-t border-gray-200 dark:border-[#30363d]">
              <Button onClick={handleLogout} variant="secondary" size="md">
                🚪 Se déconnecter
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
