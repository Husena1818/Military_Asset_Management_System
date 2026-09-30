import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "https://military-asset-management-system-n4ie.onrender.com";

/* =========================================================
   LOGIN PAGE
========================================================= */

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/token/`, {
        username,
        password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("username", username);

      onLogin(response.data.access, username);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <div className="logo-icon">M</div>
          <div>
            <h1>Military Asset</h1>
            <p>Management System</p>
          </div>
        </div>

        <div className="login-title">
          <h2>Welcome Back</h2>
          <p>Sign in to access the asset management dashboard.</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

      </div>
    </div>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({ title, value, subtitle, onClick }) {
  return (
    <div
      className={`metric-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="metric-title">
        {title}
      </div>

      <div className="metric-value">
        {value ?? 0}
      </div>

      {subtitle && (
        <div className="metric-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}


/* =========================================================
   PURCHASES PAGE
========================================================= */

function PurchasesPage({ token }) {
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    base: "",
    equipment_type: "",
    quantity: "",
    purchase_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        purchaseResponse,
        baseResponse,
        equipmentResponse,
      ] = await Promise.all([
        axios.get(`${API}/purchases/`, { headers }),
        axios.get(`${API}/bases/`, { headers }),
        axios.get(`${API}/equipment-types/`, { headers }),
      ]);

      setPurchases(
        Array.isArray(purchaseResponse.data)
          ? purchaseResponse.data
          : purchaseResponse.data.results || []
      );

      setBases(
        Array.isArray(baseResponse.data)
          ? baseResponse.data
          : baseResponse.data.results || []
      );

      setEquipmentTypes(
        Array.isArray(equipmentResponse.data)
          ? equipmentResponse.data
          : equipmentResponse.data.results || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load purchases."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      await axios.post(
        `${API}/purchases/`,
        {
          base: Number(form.base),
          equipment_type: Number(form.equipment_type),
          quantity: Number(form.quantity),
          purchase_date: form.purchase_date || new Date().toISOString(),
        },
        { headers }
      );

      setMessage("Purchase added successfully.");

      setForm({
        base: "",
        equipment_type: "",
        quantity: "",
        purchase_date: "",
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Failed to add purchase."
      );
    } finally {
      setSaving(false);
    }
  };

  const getBaseName = (id) => {
    const base = bases.find(
      (item) => Number(item.id) === Number(id)
    );

    return base ? base.name : id;
  };

  const getEquipmentName = (id) => {
    const equipment = equipmentTypes.find(
      (item) => Number(item.id) === Number(id)
    );

    return equipment ? equipment.name : id;
  };

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h1>Purchases</h1>
          <p>Manage asset purchases and incoming stock.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "+ Add Purchase"}
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card">

          <div className="table-header">
            <div>
              <h2>Add Purchase</h2>
              <p>Enter new purchased asset details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="purchase-form">

              <div className="form-group">
                <label>Base</label>

                <select
                  name="base"
                  value={form.base}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Base</option>

                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Equipment Type</label>

                <select
                  name="equipment_type"
                  value={form.equipment_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Equipment</option>

                  {equipmentTypes.map((equipment) => (
                    <option
                      key={equipment.id}
                      value={equipment.id}
                    >
                      {equipment.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Date</label>

                <input
                  type="date"
                  name="purchase_date"
                  value={form.purchase_date}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Purchase"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="table-card">

        <div className="table-header">
          <div>
            <h2>Purchase Records</h2>
            <p>{purchases.length} record(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">
            Loading purchases...
          </div>
        ) : purchases.length === 0 ? (
          <div className="empty-message">
            No purchase records available.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Base</th>
                  <th>Equipment</th>
                  <th>Quantity</th>
                  <th>Purchase Date</th>
                </tr>
              </thead>

              <tbody>

                {purchases.map((item) => (
                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>
                      {getBaseName(item.base)}
                    </td>

                    <td>
                      {getEquipmentName(
                        item.equipment_type
                      )}
                    </td>

                    <td>{item.quantity}</td>

                    <td>
                      {item.purchase_date
                        ? new Date(
                            item.purchase_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   TRANSFERS PAGE
========================================================= */

function TransfersPage({ token }) {
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    from_base: "",
    to_base: "",
    equipment_type: "",
    quantity: "",
    transfer_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        transferResponse,
        baseResponse,
        equipmentResponse,
      ] = await Promise.all([
        axios.get(`${API}/transfers/`, { headers }),
        axios.get(`${API}/bases/`, { headers }),
        axios.get(`${API}/equipment-types/`, { headers }),
      ]);

      setTransfers(
        Array.isArray(transferResponse.data)
          ? transferResponse.data
          : transferResponse.data.results || []
      );

      setBases(
        Array.isArray(baseResponse.data)
          ? baseResponse.data
          : baseResponse.data.results || []
      );

      setEquipmentTypes(
        Array.isArray(equipmentResponse.data)
          ? equipmentResponse.data
          : equipmentResponse.data.results || []
      );

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load transfers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      await axios.post(
        `${API}/transfers/`,
        {
          from_base: Number(form.from_base),
          to_base: Number(form.to_base),
          equipment_type: Number(form.equipment_type),
          quantity: Number(form.quantity),
          transfer_date: form.transfer_date
            ? new Date(form.transfer_date).toISOString()
            : new Date().toISOString(),
        },
        { headers }
      );

      setMessage("Transfer recorded successfully.");

      setForm({
        from_base: "",
        to_base: "",
        equipment_type: "",
        quantity: "",
        transfer_date: "",
      });

      setShowForm(false);

      await loadData();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Failed to record transfer."
      );
    } finally {
      setSaving(false);
    }
  };

  const getBaseName = (id) => {
    const base = bases.find(
      (item) => Number(item.id) === Number(id)
    );

    return base ? base.name : id;
  };

  const getEquipmentName = (id) => {
    const equipment = equipmentTypes.find(
      (item) => Number(item.id) === Number(id)
    );

    return equipment ? equipment.name : id;
  };

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h1>Transfers</h1>
          <p>Track asset movement between bases.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "+ Add Transfer"}
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card">

          <div className="table-header">
            <div>
              <h2>Record Transfer</h2>
              <p>Enter transfer details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="purchase-form">

              <div className="form-group">
                <label>From Base</label>

                <select
                  name="from_base"
                  value={form.from_base}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select From Base
                  </option>

                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>To Base</label>

                <select
                  name="to_base"
                  value={form.to_base}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select To Base
                  </option>

                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Equipment Type</label>

                <select
                  name="equipment_type"
                  value={form.equipment_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Equipment
                  </option>

                  {equipmentTypes.map((equipment) => (
                    <option
                      key={equipment.id}
                      value={equipment.id}
                    >
                      {equipment.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="form-group">
                <label>Transfer Date</label>

                <input
                  type="datetime-local"
                  name="transfer_date"
                  value={form.transfer_date}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Record Transfer"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="table-card">

        <div className="table-header">
          <div>
            <h2>Transfer History</h2>
            <p>{transfers.length} record(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">
            Loading transfers...
          </div>
        ) : transfers.length === 0 ? (
          <div className="empty-message">
            No transfer records available.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>From Base</th>
                  <th>To Base</th>
                  <th>Equipment</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {transfers.map((item) => (
                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>
                      {getBaseName(item.from_base)}
                    </td>

                    <td>
                      {getBaseName(item.to_base)}
                    </td>

                    <td>
                      {getEquipmentName(
                        item.equipment_type
                      )}
                    </td>

                    <td>{item.quantity}</td>

                    <td>
                      {item.transfer_date
                        ? new Date(
                            item.transfer_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   ASSIGNMENTS PAGE
========================================================= */

function AssignmentsPage({ token }) {
  const [assignments, setAssignments] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    base: "",
    equipment_type: "",
    personnel: "",
    quantity: "",
    assignment_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        assignmentResponse,
        baseResponse,
        equipmentResponse,
      ] = await Promise.all([
        axios.get(`${API}/assignments/`, { headers }),
        axios.get(`${API}/bases/`, { headers }),
        axios.get(`${API}/equipment-types/`, { headers }),
      ]);

      setAssignments(
        Array.isArray(assignmentResponse.data)
          ? assignmentResponse.data
          : assignmentResponse.data.results || []
      );

      setBases(
        Array.isArray(baseResponse.data)
          ? baseResponse.data
          : baseResponse.data.results || []
      );

      setEquipmentTypes(
        Array.isArray(equipmentResponse.data)
          ? equipmentResponse.data
          : equipmentResponse.data.results || []
      );

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      await axios.post(
        `${API}/assignments/`,
        {
          base: Number(form.base),
          equipment_type: Number(form.equipment_type),
          personnel: Number(form.personnel),
          quantity: Number(form.quantity),
          assignment_date: form.assignment_date
            ? new Date(
                form.assignment_date
              ).toISOString()
            : new Date().toISOString(),
        },
        { headers }
      );

      setMessage("Assignment recorded successfully.");

      setForm({
        base: "",
        equipment_type: "",
        personnel: "",
        quantity: "",
        assignment_date: "",
      });

      setShowForm(false);

      await loadData();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Failed to record assignment."
      );
    } finally {
      setSaving(false);
    }
  };

  const getBaseName = (id) => {
    const base = bases.find(
      (item) => Number(item.id) === Number(id)
    );

    return base ? base.name : id;
  };

  const getEquipmentName = (id) => {
    const equipment = equipmentTypes.find(
      (item) => Number(item.id) === Number(id)
    );

    return equipment ? equipment.name : id;
  };

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h1>Assignments</h1>
          <p>Track assets assigned to personnel.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "+ Add Assignment"}
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card">

          <div className="table-header">
            <div>
              <h2>Record Assignment</h2>
              <p>Assign assets to personnel.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="purchase-form">

              <div className="form-group">
                <label>Base</label>

                <select
                  name="base"
                  value={form.base}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Base</option>

                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Equipment Type</label>

                <select
                  name="equipment_type"
                  value={form.equipment_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Equipment
                  </option>

                  {equipmentTypes.map((equipment) => (
                    <option
                      key={equipment.id}
                      value={equipment.id}
                    >
                      {equipment.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Personnel User ID</label>

                <input
                  type="number"
                  name="personnel"
                  min="1"
                  value={form.personnel}
                  onChange={handleChange}
                  placeholder="Enter user ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="form-group">
                <label>Assignment Date</label>

                <input
                  type="datetime-local"
                  name="assignment_date"
                  value={form.assignment_date}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Record Assignment"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="table-card">

        <div className="table-header">
          <div>
            <h2>Assignment Records</h2>
            <p>{assignments.length} record(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="empty-message">
            No assignment records available.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Base</th>
                  <th>Equipment</th>
                  <th>Personnel</th>
                  <th>Quantity</th>
                  <th>Assignment Date</th>
                </tr>
              </thead>

              <tbody>

                {assignments.map((item) => (
                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>
                      {getBaseName(item.base)}
                    </td>

                    <td>
                      {getEquipmentName(
                        item.equipment_type
                      )}
                    </td>

                    <td>
                      {item.personnel}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      {item.assignment_date
                        ? new Date(
                            item.assignment_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   EXPENDITURES PAGE
========================================================= */

function ExpendituresPage({ token }) {
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    base: "",
    equipment_type: "",
    quantity: "",
    expenditure_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        expenditureResponse,
        baseResponse,
        equipmentResponse,
      ] = await Promise.all([
        axios.get(`${API}/expenditures/`, { headers }),
        axios.get(`${API}/bases/`, { headers }),
        axios.get(`${API}/equipment-types/`, { headers }),
      ]);

      setExpenditures(
        Array.isArray(expenditureResponse.data)
          ? expenditureResponse.data
          : expenditureResponse.data.results || []
      );

      setBases(
        Array.isArray(baseResponse.data)
          ? baseResponse.data
          : baseResponse.data.results || []
      );

      setEquipmentTypes(
        Array.isArray(equipmentResponse.data)
          ? equipmentResponse.data
          : equipmentResponse.data.results || []
      );

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load expenditure records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.base) {
      setError("Please select a base.");
      return;
    }

    if (!form.equipment_type) {
      setError("Please select an equipment type.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        `${API}/expenditures/`,
        {
          base: Number(form.base),
          equipment_type: Number(form.equipment_type),
          quantity: Number(form.quantity),
          expenditure_date: form.expenditure_date
            ? new Date(
                form.expenditure_date
              ).toISOString()
            : new Date().toISOString(),
        },
        { headers }
      );

      setMessage(
        "Expenditure recorded successfully."
      );

      setForm({
        base: "",
        equipment_type: "",
        quantity: "",
        expenditure_date: "",
      });

      setShowForm(false);

      await loadData();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Failed to record expenditure."
      );
    } finally {
      setSaving(false);
    }
  };

  const getBaseName = (id) => {
    const base = bases.find(
      (item) => Number(item.id) === Number(id)
    );

    return base ? base.name : id;
  };

  const getEquipmentName = (id) => {
    const equipment = equipmentTypes.find(
      (item) => Number(item.id) === Number(id)
    );

    return equipment ? equipment.name : id;
  };

  return (
    <div className="page-content">

      <div className="page-heading">

        <div>
          <h1>Expenditures</h1>
          <p>
            Track consumed and expended assets.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
            setError("");
          }}
        >
          {showForm
            ? "Close Form"
            : "+ Add Expenditure"}
        </button>

      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-card">

          <div className="table-header">
            <div>
              <h2>Record Expenditure</h2>
              <p>
                Enter the asset consumption details.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="purchase-form">

              <div className="form-group">
                <label>Base</label>

                <select
                  name="base"
                  value={form.base}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Base
                  </option>

                  {bases.map((base) => (
                    <option
                      key={base.id}
                      value={base.id}
                    >
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Equipment Type</label>

                <select
                  name="equipment_type"
                  value={form.equipment_type}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Equipment
                  </option>

                  {equipmentTypes.map(
                    (equipment) => (
                      <option
                        key={equipment.id}
                        value={equipment.id}
                      >
                        {equipment.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Expenditure Date</label>

                <input
                  type="datetime-local"
                  name="expenditure_date"
                  value={form.expenditure_date}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Record Expenditure"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="table-card">

        <div className="table-header">

          <div>
            <h2>Expenditures Records</h2>

            <p>
              {expenditures.length} record(s)
            </p>
          </div>

        </div>

        {loading ? (
          <div className="loading-message">
            Loading expenditure records...
          </div>
        ) : expenditures.length === 0 ? (
          <div className="empty-message">
            No expenditure records available.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Base</th>
                  <th>Equipment</th>
                  <th>Quantity</th>
                  <th>Expenditure Date</th>
                </tr>
              </thead>

              <tbody>

                {expenditures.map((item) => (

                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>
                      {getBaseName(item.base)}
                    </td>

                    <td>
                      {getEquipmentName(
                        item.equipment_type
                      )}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      {item.expenditure_date
                        ? new Date(
                            item.expenditure_date
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   AUDIT LOGS PAGE
========================================================= */

function AuditLogsPage({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const loadLogs = async () => {

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API}/audit-logs/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLogs(
          Array.isArray(response.data)
            ? response.data
            : response.data.results || []
        );

      } catch (err) {

        setError(
          err.response?.data?.detail ||
            "Failed to load audit logs."
        );

      } finally {
        setLoading(false);
      }
    };

    loadLogs();

  }, [token]);

  return (
    <div className="page-content">

      <div className="page-heading">

        <div>
          <h1>Audit Logs</h1>

          <p>
            Track system activities and user actions.
          </p>
        </div>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="table-card">

        <div className="table-header">

          <div>
            <h2>Activity History</h2>

            <p>
              System actions recorded for accountability.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="loading-message">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-message">
            No audit logs available.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>

                {logs.map((log) => (

                  <tr key={log.id}>

                    <td>{log.id}</td>

                    <td>{log.user}</td>

                    <td>{log.action}</td>

                    <td>
                      {log.timestamp
                        ? new Date(
                            log.timestamp
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [dashboard, setDashboard] = useState(null);

  const [bases, setBases] = useState([]);

  const [equipmentTypes, setEquipmentTypes] =
    useState([]);

  const [filters, setFilters] = useState({
    date: "",
    base: "",
    equipment_type: "",
  });

  const [showMovement, setShowMovement] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [activePage, setActivePage] =
    useState("Dashboard");


  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  const loadDashboard = async () => {

    if (!token) return;

    try {

      setLoading(true);
      setError("");

      const params = {};

      if (filters.date) {
        params.date_from = filters.date;
        params.date_to = filters.date;
      }

      if (filters.base) {
        params.base = filters.base;
      }

      if (filters.equipment_type) {
        params.equipment_type =
          filters.equipment_type;
      }

      const response = await axios.get(
        `${API}/dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      setDashboard(response.data);

    } catch (err) {

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to load dashboard."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     LOAD FILTER DATA
  ===================================================== */

  const loadFilters = async () => {

    if (!token) return;

    try {

      const [baseResponse, equipmentResponse] =
        await Promise.all([
          axios.get(`${API}/bases/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          axios.get(`${API}/equipment-types/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      setBases(
        Array.isArray(baseResponse.data)
          ? baseResponse.data
          : baseResponse.data.results || []
      );

      setEquipmentTypes(
        Array.isArray(equipmentResponse.data)
          ? equipmentResponse.data
          : equipmentResponse.data.results || []
      );

    } catch (err) {

      console.error(err);

    }
  };


  useEffect(() => {

    if (token) {
      loadFilters();
      loadDashboard();
    }

  }, [token]);


  useEffect(() => {

    if (token && activePage === "Dashboard") {
      loadDashboard();
    }

  }, [filters]);


  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = (newToken, newUsername) => {

    setToken(newToken);
    setUsername(newUsername);

    setActivePage("Dashboard");
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    setToken(null);
    setUsername("");
    setDashboard(null);
  };


  /* =====================================================
     IF NOT LOGGED IN
  ===================================================== */

  if (!token) {

    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );

  }


  /* =====================================================
     DASHBOARD PAGE
  ===================================================== */

  const dashboardPage = (

    <div className="page-content">

      <div className="page-heading">

        <div>
          <h1>Dashboard</h1>

          <p>
            Military Asset Management Overview
          </p>
        </div>

      </div>


      {/* FILTERS */}

      <div className="filters-card">

        <div className="filter-group">

          <label>Date</label>

          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters({
                ...filters,
                date: e.target.value,
              })
            }
          />

        </div>


        <div className="filter-group">

          <label>Base</label>

          <select
            value={filters.base}
            onChange={(e) =>
              setFilters({
                ...filters,
                base: e.target.value,
              })
            }
          >

            <option value="">
              All Bases
            </option>

            {bases.map((base) => (

              <option
                key={base.id}
                value={base.id}
              >
                {base.name}
              </option>

            ))}

          </select>

        </div>


        <div className="filter-group">

          <label>Equipment Type</label>

          <select
            value={filters.equipment_type}
            onChange={(e) =>
              setFilters({
                ...filters,
                equipment_type:
                  e.target.value,
              })
            }
          >

            <option value="">
              All Equipment
            </option>

            {equipmentTypes.map(
              (equipment) => (

                <option
                  key={equipment.id}
                  value={equipment.id}
                >
                  {equipment.name}
                </option>

              )
            )}

          </select>

        </div>

      </div>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {loading ? (

        <div className="loading-message">
          Loading dashboard...
        </div>

      ) : (

        <>

          {/* METRICS */}

          <div className="metrics-grid">

            <MetricCard
              title="Opening Balance"
              value={
                dashboard?.opening_balance ?? 0
              }
              subtitle="Starting stock"
            />

            <MetricCard
              title="Purchases"
              value={
                dashboard?.purchases ?? 0
              }
              subtitle="Assets purchased"
            />

            <MetricCard
              title="Transfer In"
              value={
                dashboard?.transfer_in ?? 0
              }
              subtitle="Assets received"
            />

            <MetricCard
              title="Transfer Out"
              value={
                dashboard?.transfer_out ?? 0
              }
              subtitle="Assets transferred"
            />

            <MetricCard
              title="Net Movement"
              value={
                dashboard?.net_movement ?? 0
              }
              subtitle="Click for calculation"
              onClick={() =>
                setShowMovement(true)
              }
            />

            <MetricCard
              title="Assigned"
              value={
                dashboard?.assigned ?? 0
              }
              subtitle="Assets assigned"
            />

            <MetricCard
              title="Expended"
              value={
                dashboard?.expended ?? 0
              }
              subtitle="Assets consumed"
            />

            <MetricCard
              title="Closing Balance"
              value={
                dashboard?.closing_balance ?? 0
              }
              subtitle="Current stock"
            />

          </div>


          {/* SUMMARY */}

          <div className="dashboard-summary">

            <div className="info-card">

              <h2>Asset Movement Summary</h2>

              <SummaryItem
                label="Opening Balance"
                value={
                  dashboard?.opening_balance ?? 0
                }
              />

              <SummaryItem
                label="Purchases"
                value={
                  dashboard?.purchases ?? 0
                }
              />

              <SummaryItem
                label="Transfer In"
                value={
                  dashboard?.transfer_in ?? 0
                }
              />

              <SummaryItem
                label="Transfer Out"
                value={
                  dashboard?.transfer_out ?? 0
                }
              />

              <SummaryItem
                label="Assigned"
                value={
                  dashboard?.assigned ?? 0
                }
              />

              <SummaryItem
                label="Expended"
                value={
                  dashboard?.expended ?? 0
                }
              />

              <SummaryItem
                label="Closing Balance"
                value={
                  dashboard?.closing_balance ?? 0
                }
              />

            </div>

          </div>

        </>

      )}


      {/* NET MOVEMENT POPUP */}

      {showMovement && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowMovement(false)
          }
        >

          <div
            className="modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Net Movement</h2>

                <p>
                  Movement calculation
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowMovement(false)
                }
              >
                ×
              </button>

            </div>

            <div className="movement-equation">

              <span>
                Purchases
              </span>

              <strong>+</strong>

              <span>
                Transfer In
              </span>

              <strong>−</strong>

              <span>
                Transfer Out
              </span>

              <strong>=</strong>

              <span className="movement-result">
                {dashboard?.net_movement ?? 0}
              </span>

            </div>

            <div className="movement-details">

              <SummaryItem
                label="Purchases"
                value={
                  dashboard?.purchases ?? 0
                }
              />

              <SummaryItem
                label="Transfer In"
                value={
                  dashboard?.transfer_in ?? 0
                }
              />

              <SummaryItem
                label="Transfer Out"
                value={
                  dashboard?.transfer_out ?? 0
                }
              />

              <SummaryItem
                label="Net Movement"
                value={
                  dashboard?.net_movement ?? 0
                }
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );


  /* =====================================================
     SELECT PAGE
  ===================================================== */

  let pageContent = dashboardPage;


  if (activePage === "Purchases") {

    pageContent = (
      <PurchasesPage token={token} />
    );

  } else if (activePage === "Transfers") {

    pageContent = (
      <TransfersPage token={token} />
    );

  } else if (activePage === "Assignments") {

    pageContent = (
      <AssignmentsPage token={token} />
    );

  } else if (activePage === "Expenditures") {

    pageContent = (
      <ExpendituresPage token={token} />
    );

  } else if (activePage === "Audit Logs") {

    pageContent = (
      <AuditLogsPage token={token} />
    );

  }


  /* =====================================================
     MAIN LAYOUT
  ===================================================== */

  return (

    <div className="app-layout">


      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">
            M
          </div>

          <div>
            <h2>Military Asset</h2>
            <span>Management System</span>
          </div>

        </div>


        <nav className="sidebar-nav">

          <button
            className={
              activePage === "Dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("Dashboard")
            }
          >
            <span className="nav-icon">
              ▦
            </span>

            Dashboard
          </button>


          <button
            className={
              activePage === "Purchases"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("Purchases")
            }
          >
            <span className="nav-icon">
              +
            </span>

            Purchases
          </button>


          <button
            className={
              activePage === "Transfers"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("Transfers")
            }
          >
            <span className="nav-icon">
              ⇄
            </span>

            Transfers
          </button>


          <button
            className={
              activePage === "Assignments"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("Assignments")
            }
          >
            <span className="nav-icon">
              ✓
            </span>

            Assignments
          </button>


          <button
            className={
              activePage === "Expenditures"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("Expenditures")
            }
          >
            <span className="nav-icon">
              −
            </span>

            Expenditures
          </button>


          <button
            className={
              activePage === "Audit Logs"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("Audit Logs")
            }
          >
            <span className="nav-icon">
              ◷
            </span>

            Audit Logs
          </button>

        </nav>


        <div className="sidebar-bottom">

  <div className="user-box">

    <div className="user-avatar">
      {username
        ? username.charAt(0).toUpperCase()
        : "U"}
    </div>

    <div className="user-details">

      <strong>
        {username || "Admin"}
      </strong>

      <span>
        Logged in
      </span>

    </div>

  </div>

  <button
    className="logout-button"
    onClick={handleLogout}
  >
    Logout
  </button>

</div>

</aside>


{/* MAIN AREA */}

<main className="main-area">

  <header className="topbar">

    <div className="breadcrumb">

      <span>
        Military Asset Management System
      </span>

      <strong>
        /
      </strong>

      <b>
        {activePage}
      </b>

    </div>

    <div className="topbar-user">

      <span>
        {username}
      </span>

    </div>

  </header>

  {pageContent}

</main>

</div>
  );
}


export default App;