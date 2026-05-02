import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";

const Nomina = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Juan Pérez",
      position: "Chef",
      salary: 2500000,
      startDate: "2023-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "María González",
      position: "Mesero",
      salary: 1200000,
      startDate: "2023-03-20",
      status: "active",
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: "",
    startDate: "",
    status: "active",
  });

  const positions = [
    "Chef",
    "Asistente de Cocina",
    "Mesero",
    "Bartender",
    "Gerente",
    "Administrador",
  ];

  const handleAddEmployee = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      name: "",
      position: "",
      salary: "",
      startDate: "",
      status: "active",
    });
  };

  const handleEditEmployee = (employee) => {
    setShowForm(true);
    setEditingId(employee.id);
    setFormData(employee);
  };

  const handleSaveEmployee = () => {
    if (!formData.name || !formData.position || !formData.salary) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (editingId) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editingId ? { ...formData, id: editingId } : emp,
        ),
      );
    } else {
      setEmployees([
        ...employees,
        { ...formData, id: Date.now(), salary: parseFloat(formData.salary) },
      ]);
    }

    setShowForm(false);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const activeEmployees = employees.filter(
    (emp) => emp.status === "active",
  ).length;

  const formatPrice = (price) => {
    return Math.round(price)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3">
              <Users size={24} className="md:w-7 md:h-7 text-violet-500" />
              <span>Nómina</span>
            </h1>
            <p className="text-neutral-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mt-2 md:mt-3">
              Gestiona empleados y salarios
            </p>
          </div>
          <button
            onClick={handleAddEmployee}
            className="bg-violet-500 hover:bg-violet-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black uppercase text-[9px] md:text-xs shadow-lg shadow-violet-500/30 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2 justify-center"
          >
            <Plus size={16} />
            Añadir Empleado
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="p-4 md:p-6 bg-neutral-900/40 border border-white/5 rounded-xl md:rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
                  Total Empleados
                </p>
                <p className="text-2xl md:text-3xl font-black text-white mt-2">
                  {employees.length}
                </p>
              </div>
              <Users className="text-violet-500" size={28} />
            </div>
          </div>

          <div className="p-4 md:p-6 bg-neutral-900/40 border border-white/5 rounded-xl md:rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
                  Activos
                </p>
                <p className="text-2xl md:text-3xl font-black text-green-400 mt-2">
                  {activeEmployees}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={28} />
            </div>
          </div>

          <div className="p-4 md:p-6 bg-neutral-900/40 border border-white/5 rounded-xl md:rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
                  Nómina Mensual
                </p>
                <p className="text-lg md:text-2xl font-black text-violet-400 mt-2">
                  ${formatPrice(totalPayroll)}
                </p>
              </div>
              <DollarSign className="text-violet-500" size={28} />
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md">
              <h2 className="text-xl md:text-2xl font-black uppercase mb-6">
                {editingId ? "Editar Empleado" : "Nuevo Empleado"}
              </h2>

              <div className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-[8px] md:text-[9px] font-bold uppercase text-neutral-500 mb-2 tracking-widest">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-neutral-800 border border-white/5 rounded-lg p-2.5 md:p-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-[8px] md:text-[9px] font-bold uppercase text-neutral-500 mb-2 tracking-widest">
                    Posición
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full bg-neutral-800 border border-white/5 rounded-lg p-2.5 md:p-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  >
                    <option value="">Selecciona una posición</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] md:text-[9px] font-bold uppercase text-neutral-500 mb-2 tracking-widest">
                    Salario Mensual
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70"
                    />
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      className="w-full bg-neutral-800 border border-white/5 rounded-lg p-2.5 md:p-3 pl-10 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                      placeholder="Ej: 1200000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] md:text-[9px] font-bold uppercase text-neutral-500 mb-2 tracking-widest">
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full bg-neutral-800 border border-white/5 rounded-lg p-2.5 md:p-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 md:py-3 border border-white/10 rounded-lg font-black uppercase text-[8px] md:text-[9px] text-neutral-400 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEmployee}
                    className="flex-1 px-4 py-2.5 md:py-3 bg-violet-500 hover:bg-violet-600 rounded-lg font-black uppercase text-[8px] md:text-[9px] text-white transition-all"
                  >
                    {editingId ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees List */}
        <div className="space-y-3 md:space-y-4">
          {employees.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
              <Users size={32} className="mx-auto text-neutral-600 mb-4" />
              <p className="text-neutral-500 font-black uppercase text-sm">
                Sin empleados registrados
              </p>
              <p className="text-neutral-600 text-xs mt-2">
                Comienza a añadir empleados a tu nómina
              </p>
            </div>
          ) : (
            employees.map((employee) => (
              <div
                key={employee.id}
                className="p-4 md:p-6 bg-neutral-900/40 border border-white/5 hover:border-violet-500/50 rounded-xl md:rounded-2xl transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm md:text-base font-black uppercase text-white mb-2">
                      {employee.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[8px] md:text-[9px]">
                      <div>
                        <p className="text-neutral-500 uppercase tracking-wider">
                          Posición
                        </p>
                        <p className="text-neutral-200 font-bold mt-1">
                          {employee.position}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500 uppercase tracking-wider">
                          Salario
                        </p>
                        <p className="text-violet-400 font-black mt-1">
                          ${formatPrice(employee.salary)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500 uppercase tracking-wider">
                          Ingreso
                        </p>
                        <p className="text-neutral-200 font-bold mt-1">
                          {new Date(employee.startDate).toLocaleDateString(
                            "es-ES",
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500 uppercase tracking-wider">
                          Estado
                        </p>
                        <p className="mt-1">
                          <span
                            className={`px-2 py-1 rounded text-[7px] font-black uppercase ${
                              employee.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {employee.status === "active"
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 lg:flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="flex-1 lg:flex-none p-2.5 md:p-3 bg-neutral-800 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 rounded-lg text-blue-400 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="flex-1 lg:flex-none p-2.5 md:p-3 bg-neutral-800 hover:bg-red-500/20 border border-white/5 hover:border-red-500/30 rounded-lg text-red-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Nomina;
