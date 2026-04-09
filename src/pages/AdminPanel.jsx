import React, { useEffect, useState, useMemo } from "react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { UserPlus, Pencil, Trash2, ShieldAlert, KeyRound, Loader2, AlertTriangle, Search, ArrowUpDown } from "lucide-react";
import './AdminPanel.css';

// Modal de confirmación genérico para acciones críticas
const ConfirmDialog = ({ isOpen, title, description, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", isDestructive = false, isLoading = false }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content modal-content-small">
                <div className="modal-header" style={{ marginBottom: '1rem' }}>
                    <h3 className="modal-title">
                        <div className={isDestructive ? 'modal-title-icon-blue' : 'modal-title-icon-purple'} style={{ color: isDestructive ? '#ef4444' : '#c193ff', backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(193, 147, 255, 0.1)' }}>
                            {isDestructive ? <AlertTriangle size={24} /> : <ShieldAlert size={24} />}
                        </div>
                        {title}
                    </h3>
                </div>
                <p className="modal-desc">{description}</p>
                <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                    <button onClick={onCancel} disabled={isLoading} className="btn-secondary">
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} disabled={isLoading} className={isDestructive ? "btn-danger-solid" : "btn-confirm"}>
                        {isLoading ? <Loader2 className="loader-spin" style={{ width: '1rem', height: '1rem' }} /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminPanel = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [roleChangeData, setRoleChangeData] = useState(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "UNVERIFIED",
    });
    const [isCreating, setIsCreating] = useState(false);

    const [userToEdit, setUserToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });
    const [isEditing, setIsEditing] = useState(false);

    const [isSendingReset, setIsSendingReset] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

    const LOCAL_API_URL = "https://security.digital-latino.com/admin/users";
    const getToken = () => localStorage.getItem("token") || localStorage.getItem("authToken");

    const filteredAndSortedUsers = useMemo(() => {
        let result = users;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.firstName || '').toLowerCase().includes(query) ||
                (u.lastName || '').toLowerCase().includes(query) ||
                (u.email || '').toLowerCase().includes(query) ||
                (u.role || '').toLowerCase().includes(query) ||
                (u.id || u.userId || '').toString().includes(query)
            );
        }

        result.sort((a, b) => {
            const getVal = (u, key) => {
                if (key === 'name') return `${u.firstName} ${u.lastName}`.toLowerCase();
                if (key === 'id') return u.id || u.userId;
                return (u[key] || '').toString().toLowerCase();
            };

            const aVal = getVal(a, sortConfig.key);
            const bVal = getVal(b, sortConfig.key);

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [users, searchQuery, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(LOCAL_API_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Error al cargar los usuarios");

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message || "Error al cargar los usuarios");
            toast({
                title: "Error de conexión",
                description: "No se pudo conectar con el servidor de administración.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const confirmRoleChange = async () => {
        if (!roleChangeData) return;
        setIsUpdatingRole(true);

        try {
            const response = await fetch(`${LOCAL_API_URL}/${roleChangeData.id}/role`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: roleChangeData.role }),
            });

            if (response.ok) {
                toast({
                    title: "Rol actualizado",
                    description: `El rol se cambió exitosamente a ${roleChangeData.role}.`,
                });
                fetchUsers();
            } else {
                throw new Error("No se pudo actualizar el rol");
            }
        } catch (err) {
            toast({
                title: "Error al actualizar",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsUpdatingRole(false);
            setRoleChangeData(null);
        }
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`${LOCAL_API_URL}/${userToDelete}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                toast({
                    title: "Usuario eliminado",
                    description: "El usuario ha sido borrado del sistema permanentemente.",
                });
                fetchUsers();
            } else {
                throw new Error("No se pudo eliminar el usuario");
            }
        } catch (err) {
            toast({
                title: "Error al eliminar",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const response = await fetch(LOCAL_API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "No se pudo crear el usuario");
            }

            toast({
                title: "¡Éxito!",
                description: "El usuario ha sido creado correctamente.",
            });
            setShowAddModal(false);
            setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "UNVERIFIED" });
            fetchUsers();
        } catch (err) {
            toast({
                title: "Error al crear",
                description: err.message || "Hubo un problema al crear el usuario.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const openEditModal = (u) => {
        setUserToEdit(u);
        setEditFormData({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
        });
    };

    const handleEditUserSubmit = async (e) => {
        e.preventDefault();
        if (!userToEdit) return;
        setIsEditing(true);

        const realId = userToEdit.id || userToEdit.userId;
        try {
            const response = await fetch(`${LOCAL_API_URL}/${realId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editFormData),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "No se pudo actualizar el usuario");
            }

            toast({
                title: "Usuario actualizado",
                description: "Los datos del usuario se guardaron correctamente.",
            });
            setUserToEdit(null);
            fetchUsers();
        } catch (err) {
            toast({
                title: "Error al actualizar",
                description: err.message || "Hubo un problema al guardar los cambios.",
                variant: "destructive",
            });
        } finally {
            setIsEditing(false);
        }
    };

    const handleSendPasswordReset = async () => {
        if (!editFormData.email) return;
        setIsSendingReset(true);
        try {
            const response = await fetch("https://security.digital-latino.com/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: editFormData.email }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "No se pudo enviar el correo");
            }

            toast({
                title: "Correo enviado",
                description: `Se ha enviado un enlace a ${editFormData.email}.`,
            });
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Hubo un problema al enviar el enlace.",
                variant: "destructive",
            });
        } finally {
            setIsSendingReset(false);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case "ADMIN": return "badge badge-admin";
            case "PREMIUM": return "badge badge-premium";
            case "ARTIST": return "badge badge-artist";
            case "PENDING_PAYMENT": return "badge badge-pending";
            default: return "badge badge-default";
        }
    };

    const getInitials = (first, last, email) => {
        if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
        if (first) return first.slice(0, 2).toUpperCase();
        if (email) return email.slice(0, 2).toUpperCase();
        return "U";
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th className="table-th" onClick={() => handleSort(sortKey)}>
            <div className="th-content">
                {label}
                <ArrowUpDown
                    size={14}
                    style={{ color: sortConfig.key === sortKey ? '#c193ff' : 'currentColor', opacity: sortConfig.key === sortKey ? 1 : 0.5 }}
                />
            </div>
        </th>
    );

    if (loading) {
        return (
            <div className="loader-container">
                <Loader2 className="loader-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="admin-container">

            <div className="admin-header-card">
                <div className="admin-header-gradient-bar"></div>
                <div>
                    <h1 className="admin-header-title">
                        PANEL &nbsp;&nbsp; ADMINISTRADOR
                    </h1>
                    <p className="admin-header-desc">
                        Gestión centralizada de usuarios. Puedes alterar roles, modificar perfiles o remover accesos del sistema permanentemente.
                    </p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <UserPlus size={20} />
                    Agregar Usuario
                </button>
            </div>

            <div className="search-container">
                <div className="search-icon-wrapper">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar usuarios por ID, nombre, email o rol..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {error && users.length === 0 && (
                <div className="error-banner">
                    <AlertTriangle size={24} />
                    <div>
                        <h4 className="error-title">Problema de conexión</h4>
                        <p className="error-msg">{error}</p>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="admin-table">
                    <thead className="table-head">
                        <tr>
                            <SortableHeader label="ID" sortKey="id" />
                            <SortableHeader label="Nombre" sortKey="name" />
                            <SortableHeader label="Email" sortKey="email" />
                            <SortableHeader label="Rol Actual" sortKey="role" />
                            <th className="table-th text-center" style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedUsers.map((u) => {
                            const realId = u.id || u.userId;
                            return (
                                <tr key={realId} className="table-row">
                                    <td className="table-td table-td-id cursor-pointer">
                                        #{realId}
                                    </td>
                                    <td className="table-td">
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {getInitials(u.firstName, u.lastName, u.email)}
                                            </div>
                                            <div>
                                                <p className="user-name">{u.firstName} {u.lastName}</p>
                                                <p className="user-type">Miembro</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-td" style={{ color: '#d1d5db' }}>
                                        {u.email}
                                    </td>
                                    <td className="table-td">
                                        <span className={getRoleBadgeClass(u.role)}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="table-td">
                                        <div className="actions-container">
                                            <div className="select-wrapper">
                                                <select
                                                    className="select-dark"
                                                    value={u.role}
                                                    onChange={(e) => setRoleChangeData({ id: realId, role: e.target.value })}
                                                >
                                                    <option value="UNVERIFIED">UNVERIFIED</option>
                                                    <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                                                    <option value="PREMIUM">PREMIUM</option>
                                                    <option value="ARTIST">ARTIST</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                                <div className="select-icon">
                                                    <ArrowUpDown size={12} />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => openEditModal(u)}
                                                className="btn-icon"
                                                title="Editar datos"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                onClick={() => setUserToDelete(realId)}
                                                className="btn-danger"
                                                title="Eliminar usuario"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {users.length === 0 && !error && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <UserPlus size={32} />
                        </div>
                        <h3 className="empty-title">Sin usuarios encontrados</h3>
                        <p className="empty-desc">No hay registros que coincidan con la búsqueda actual.</p>
                    </div>
                )}
            </div>

            {/* MODAL: AGREGAR USUARIO */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <div className="modal-title-icon-purple">
                                    <UserPlus size={20} />
                                </div>
                                Crear Perfil
                            </h2>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input required type="text" placeholder="Ej. John" className="form-input" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellido</label>
                                    <input required type="text" placeholder="Ej. Doe" className="form-input" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Correo Electrónico</label>
                                <input required type="email" placeholder="correo@ejemplo.com" className="form-input" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Contraseña</label>
                                <input required type="password" placeholder="••••••••" className="form-input" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Rol Inicial</label>
                                <select className="form-input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="UNVERIFIED">UNVERIFIED</option>
                                    <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                                    <option value="PREMIUM">PREMIUM</option>
                                    <option value="ARTIST">ARTIST</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancelar</button>
                                <button type="submit" disabled={isCreating} className="btn-confirm">
                                    {isCreating ? <Loader2 className="loader-spin" size={20} /> : "Crear Usuario"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDITAR USUARIO */}
            {userToEdit && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <div className="modal-title-icon-blue">
                                    <Pencil size={20} />
                                </div>
                                Editar Usuario
                            </h2>
                        </div>

                        <form onSubmit={handleEditUserSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input required type="text" className="form-input" value={editFormData.firstName} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellido</label>
                                    <input required type="text" className="form-input" value={editFormData.lastName} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Correo Electrónico</label>
                                <input required type="email" className="form-input" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />

                                <div style={{ marginTop: '1rem', paddingBottom: '0.5rem' }}>
                                    <button type="button" onClick={handleSendPasswordReset} disabled={isSendingReset} className="reset-link">
                                        <KeyRound size={14} />
                                        {isSendingReset ? 'Enviando link...' : 'Enviar link de recuperación de contraseña'}
                                    </button>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setUserToEdit(null)} className="btn-secondary">Cancelar</button>
                                <button type="submit" disabled={isEditing} className="btn-confirm" style={{ background: '#3b82f6', boxShadow: 'none', color: 'white' }}>
                                    {isEditing ? <Loader2 className="loader-spin" size={20} style={{ color: 'white' }} /> : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={userToDelete !== null}
                title="Eliminar Usuario"
                description="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer. Removará todos sus datos permanentemente de la base de datos."
                confirmText="Sí, Eliminar"
                cancelText="Mantener"
                isDestructive={true}
                isLoading={isDeleting}
                onConfirm={confirmDeleteUser}
                onCancel={() => !isDeleting && setUserToDelete(null)}
            />

            <ConfirmDialog
                isOpen={roleChangeData !== null}
                title="Cambiar Autorización"
                description={`Estás a punto de alterar los privilegios de este perfil en el sistema, modificando el rol a: ${roleChangeData?.role}. ¿Deseas continuar?`}
                confirmText="Actualizar Rol"
                cancelText="Cancelar"
                isLoading={isUpdatingRole}
                onConfirm={confirmRoleChange}
                onCancel={() => !isUpdatingRole && setRoleChangeData(null)}
            />

        </div>
    );
};

export default AdminPanel;
