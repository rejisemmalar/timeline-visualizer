import { useEffect, useState } from "react";
import "../styles/timeline.css";

const STORAGE_KEY = "timeline_milestone";

const emptyForm = {
  id: null,
  date: "",
  name: "",
  category: "",
  note: "",
  imageBase64: "",
};

function TimeLine() {
  const [mileStones, setMileStones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [showConfirmDel, setShowConfirmDel] = useState(false);
  const [showImgModal, setShowImgModal] = useState(false);
  const [errors, setErrors] = useState({});

  // load data from local storage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setMileStones(data);
  }, []);

  // saved data from local storage
  const saveToStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setMileStones(data);
  };

  // open
  const openAddModal = () => {
    setFormData(emptyForm);
    setIsEdit(false);
    setShowModal(true);
  };

  // edit
  const openEditModal = (item) => {
    setFormData(item);
    setIsEdit(true);
    setShowModal(true);
  };

  // input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // img handling
    if (name === "image" && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageBase64: reader.result,
        });
      };

      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  //save
  const handleSave = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = "This field is required";
    if (!formData.category) newErrors.category = "This field is required";
    if (!formData.note.trim()) newErrors.note = "This field is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let updated;
    if (isEdit) {
      updated = mileStones.map((m) => (m.id === formData.id ? formData : m));
    } else {
      updated = [...mileStones, { ...formData, id: Date.now() }];
    }

    saveToStorage(updated);
    setShowModal(false);
    setErrors({});
  };

  //delete
  const handleDelete = () => {
    const filtered = mileStones.filter((m) => m.id !== formData.id);
    saveToStorage(filtered);
    setShowModal(false);
  };

  // Date
  const sortedMilestones = [...mileStones]
    .filter((m) => m.date)
    .sort((a, b) => {
      const parseDate = (d) => {
        if (d.includes("-") && d.split("-")[0].length === 4) {
          return new Date(d); // YYYY-MM-DD
        }
        const [day, month, year] = d.split("-");
        return new Date(`${year}-${month}-${day}`); // DD-MM-YYYY
      };
      return parseDate(a.date) - parseDate(b.date);
    });

  // showed year wise
  const groupedByYear = sortedMilestones.reduce((acc, item) => {
    const year = new Date(item.date).getFullYear();
    if (isNaN(year)) return acc;
    acc[year] = acc[year] || [];
    acc[year].push(item);
    return acc;
  }, {});

  // ====================Render================ //
  return (
    <div className="timeline-wrapper">
      <div className="timeline-box">
        <h2 className="timeline-title">TimeLine Visualizer</h2>

        <button className="add-milestone-btn" onClick={openAddModal}>
          <i className="bi bi-journal-plus me-2"></i> Add MileStone
        </button>

        {Object.keys(groupedByYear)
          .sort((a, b) => b - a)
          .map((year) => (
            <div key={year}>
              <h4 className="year-badge">{year}</h4>

              {groupedByYear[year].map((item) => (
                <div
                  key={item.id}
                  className="timeline-card"
                  onClick={() => openEditModal(item)}
                >
                  <small>{item.date}</small>
                  <h6>{item.category}</h6>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          ))}
      </div>

      {showModal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h4>{isEdit ? "Edit Milestone" : "Add Milestone"}</h4>
            <div className="field-group">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              <div className="error-slot">
                {errors.date && (
                  <small className="field-error">{errors.date}</small>
                )}
              </div>
            </div>

            <div className="field-group">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option>Education</option>
                <option>Work</option>
                <option>Travel</option>
                <option>Celebration</option>
                <option>Happy Mind</option>
                <option>Sad Mind</option>
                <option>Personal</option>
              </select>
              <div className="error-slot">
                {errors.category && (
                  <small className="field-error">{errors.category}</small>
                )}
              </div>
            </div>

            <div className="field-group">
              <textarea
                name="note"
                placeholder="Important note"
                value={formData.note}
                onChange={handleChange}
              />
              <div className="error-slot">
                {errors.note && (
                  <small className="field-error">{errors.note}</small>
                )}
              </div>
            </div>
            <label className="file-btn">
              Choose Image
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                hidden
              />
            </label>

            {formData.imageBase64 && (
              <div className="image-preview-wrapper">
                <img
                  src={formData.imageBase64}
                  alt="preview"
                  onClick={() => setShowImgModal(true)}
                />
              </div>
            )}
            {showImgModal && (
              <div
                className="custom-modal-backdrop"
                style={{ zIndex: 3000 }}
                onClick={() => setShowImgModal(false)}
              >
                <div
                  className="image-view-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={formData.imageBase64} alt="full-view" />
                  <button onClick={() => setShowImgModal(false)}>✕</button>
                </div>
              </div>
            )}

            <div className="modal-actions">
              {isEdit && (
                <button
                  className="danger"
                  onClick={() => {
                    setShowConfirmDel(true);
                  }}
                >
                  Delete
                </button>
              )}
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="success" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
          {showConfirmDel && (
            <div className="custom-modal-backdrop">
              <div className="custom-modal confirm-modal">
                <h4>Confirm Delete</h4>

                <p>
                  Are you sure you want to delete this milestone?
                  <br />
                </p>

                <div className="modal-actions">
                  <button onClick={() => setShowConfirmDel(false)}>
                    Cancel
                  </button>

                  <button
                    className="danger"
                    onClick={() => {
                      handleDelete();
                      setShowConfirmDel(false);
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default TimeLine;
