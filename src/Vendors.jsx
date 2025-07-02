import React, { useEffect, useState } from "react";
import { useDesignerData } from "../contexts/DesignerDataContext";
import { useNavigate } from "react-router-dom";
import styles from "./Vendors.module.css";
import {
  FiSearch,
  FiInfo,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronUp,
  FiMessageSquare,
  FiPlus,
  FiUserPlus,
  FiRefreshCw,
  FiCheck,
  FiPackage,
  FiShoppingCart,
  FiImage,
} from "react-icons/fi";

import api from "../services/api";
import { Modal, Button } from "react-bootstrap";

function Vendors({ username, role, userId }) {
  const { vendors, setVendors, products, setProducts } = useDesignerData();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProductId, setActiveProductId] = useState(null);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    name: "",
    contact: "",
    email: "",
    materials: [],
    lead_time_days: 14,
    rating: 4.0,
  });
  const [materialInput, setMaterialInput] = useState("");
  const [allVendors, setAllVendors] = useState([]);
  const [addingVendor, setAddingVendor] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductImageModal, setShowProductImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();

  // Fetch vendors and products data only if context data is empty
  useEffect(() => {
    const fetchDesignerVendors = async () => {
      try {
        setLoading(true);

        if (userId && vendors.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Save data to context
          setVendors(data.vendors);
          console.log("Fetched Vendors from API:", data.vendors);

          //Fetch all products
          if (products.length === 0) {
            const allProducts = await api.getData("products");
            setProducts(allProducts);
          }
        }

        // Fetch all available vendors for the add vendor modal
        const allVendorsData = await api.getAllVendors();
        setAllVendors(allVendorsData);
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchDesignerVendors();
  }, [
    userId,
    role,
    vendors.length,
    products.length,
    setVendors,
    setProducts,
    refreshing,
  ]);

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.materials.some((material) =>
        material.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Get products for the selected vendor
  const vendorProducts = selectedVendor
    ? products.filter((product) => product.vendor_id === selectedVendor.id)
    : [];
  console.log(vendorProducts);

  // Toggle product details
  const toggleProductDetails = (productId) => {
    if (activeProductId === productId) {
      setActiveProductId(null);
    } else {
      setActiveProductId(productId);
    }
  };

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setActiveProductId(null); // Reset active product when changing vendors
  };

  // Handle Add Vendor form input changes
  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setNewVendorData({
      ...newVendorData,
      [name]: value,
    });
  };

  // Handle adding a material to the list
  const handleAddMaterial = () => {
    if (
      materialInput.trim() !== "" &&
      !newVendorData.materials.includes(materialInput.trim())
    ) {
      setNewVendorData({
        ...newVendorData,
        materials: [...newVendorData.materials, materialInput.trim()],
      });
      setMaterialInput("");
    }
  };

  // Handle removing a material from the list
  const handleRemoveMaterial = (material) => {
    setNewVendorData({
      ...newVendorData,
      materials: newVendorData.materials.filter((m) => m !== material),
    });
  };

  // Handle form submission for adding a new vendor
  const handleAddVendor = (e) => {
    e.preventDefault();

    // In a real app, this would send a request to the API
    // For now, we'll just add it to the context state
    const newVendor = {
      ...newVendorData,
      id: `vendor_${Date.now()}`, // Generate a unique ID
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", // Default avatar
    };

    setVendors([...vendors, newVendor]); // Update context state

    // Reset form
    setNewVendorData({
      name: "",
      contact: "",
      email: "",
      materials: [],
      lead_time_days: 14,
      rating: 4.0,
    });

    // Close modal
    setShowAddVendorModal(false);
  };

  // Navigate to Messages with the selected vendor
  const handleSendMessage = (vendor) => {
    navigate("/designer/messages", {
      state: {
        vendorId: vendor.id,
        vendorName: vendor.name,
      },
    });
  };

  // Get vendors that aren't connected to this designer
  const getAvailableVendors = () => {
    const connectedVendorIds = vendors.map((vendor) => vendor.id);
    return allVendors.filter(
      (vendor) => !connectedVendorIds.includes(vendor.id)
    );
  };

  // Add a vendor connection
  const addVendorConnection = async (vendorId) => {
    setAddingVendor(true);
    try {
      // Call the API to update the vendor connection
      const response = await api.addVendorConnection(userId, vendorId);

      if (response.success) {
        // Find the vendor from allVendors
        const vendorToAdd = allVendors.find((v) => v.id === vendorId);

        if (vendorToAdd) {
          // Add to local state
          setVendors([...vendors, vendorToAdd]);
        }

        // Refresh the data
        setRefreshing((prev) => !prev);
      }
    } catch (error) {
      console.error("Error adding vendor connection:", error);
    } finally {
      setAddingVendor(false);
    }
  };

  // Show product image in modal
  const handleShowImage = (image, e) => {
    e.stopPropagation();
    setSelectedImage(image);
    setShowProductImageModal(true);
  };

  // Format image URL to get a usable version
  const formatImageUrl = (url) => {
    // If URL is from Unsplash, convert it to a direct image URL
    if (url.includes("unsplash.com/photos") && !url.includes("?")) {
      return `${url}/download?w=800`;
    }
    return url;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Vendors</h1>

      <div className={styles.topActions}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search vendors by name or materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.addVendorButton}
          onClick={() => setShowAddVendorModal(true)}
        >
          <FiPlus />
          Add Vendor
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading vendors data...</div>
      ) : (
        <div className={styles.contentLayout}>
          {/* Vendors List */}
          <div className={styles.vendorsList}>
            <h2 className={styles.sectionTitle}>My Associated Vendors</h2>

            {filteredVendors.length === 0 ? (
              <div className={styles.noResults}>
                <p>No vendors match your search or you have no vendors.</p>
                <button
                  className={styles.addVendorButton}
                  onClick={() => setShowAddVendorModal(true)}
                >
                  <FiPlus />
                  Add a Vendor
                </button>
              </div>
            ) : (
              <>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewToggleButton} ${
                      viewMode === "grid" ? styles.activeView : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`${styles.viewToggleButton} ${
                      viewMode === "list" ? styles.activeView : ""
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <FiList />
                  </button>
                </div>

                <div
                  className={
                    viewMode === "grid"
                      ? styles.vendorsGrid
                      : styles.vendorsList
                  }
                >
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`${styles.vendorCard} ${
                        selectedVendor?.id === vendor.id
                          ? styles.activeVendor
                          : ""
                      }`}
                      onClick={() => handleVendorSelect(vendor)}
                    >
                      <div className={styles.vendorHeader}>
                        <div className={styles.vendorAvatar}>
                          {vendor.avatar ? (
                            <img
                              src={vendor.avatar}
                              alt={vendor.name}
                              className={styles.avatarImg}
                            />
                          ) : (
                            <div className={styles.avatarInitials}>
                              {vendor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                          )}
                        </div>
                        <div className={styles.vendorInfo}>
                          <h3 className={styles.vendorName}>{vendor.name}</h3>
                          <p className={styles.vendorContact}>
                            Contact: {vendor.contact}
                          </p>
                        </div>
                      </div>

                      {/* Vendor details section start */}
                      <div className={styles.vendorDetails}>
                        <div className={styles.vendorMaterials}>
                          <span className={styles.materialsLabel}>
                            Materials:
                          </span>
                          <div className={styles.materialsTags}>
                            {(vendor.materials || []).map((material) => (
                              <span
                                key={material}
                                className={styles.materialTag}
                              >
                                {material}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={styles.vendorStats}>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>Lead time:</span>
                            <span className={styles.statValue}>
                              {vendor.lead_time_days} days
                            </span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>Rating:</span>
                            <div className={styles.ratingStars}>
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`${styles.star} ${
                                    i < Math.floor(vendor.rating)
                                      ? styles.filled
                                      : ""
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className={styles.ratingValue}>
                                ({vendor.rating})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Message icon button instead of full button */}
                        <div className={styles.cardActions}>
                          <button
                            className={styles.iconButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendMessage(vendor);
                            }}
                            title="Message Vendor"
                          >
                            <FiMessageSquare />
                          </button>
                        </div>
                      </div>
                      {/* Vendor details section end */}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Vendor Details / Products */}
          <div className={styles.vendorDetails}>
            {selectedVendor ? (
              <>
                <h2 className={styles.sectionTitle}>
                  Products by {selectedVendor.name}
                </h2>

                {vendorProducts.length === 0 ? (
                  <div className={styles.noProducts}>
                    <p>No products available from this vendor.</p>
                  </div>
                ) : (
                  <div className={styles.productsList}>
                    {vendorProducts.map((product) => (
                      <div key={product.id} className={styles.productCard}>
                        <div className={styles.productHeader}>
                          <h3 className={styles.productName}>{product.name}</h3>
                          <div className={styles.productPrice}>
                            ₹{product.price.toFixed(2)}
                          </div>
                        </div>

                        <div className={styles.productCategory}>
                          <span className={styles.categoryLabel}>
                            Category:
                          </span>
                          <span className={styles.categoryValue}>
                            {product.category}
                          </span>
                        </div>

                        <div
                          className={styles.productExpand}
                          onClick={() => toggleProductDetails(product.id)}
                        >
                          {activeProductId === product.id ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )}
                        </div>
                        {activeProductId === product.id && (
                          <div className={styles.productDetails}>
                            <p className={styles.productDescription}>
                              {product.description}
                            </p>

                            {/* Product Images Section */}
                            {product.images && product.images.length > 0 && (
                              <div className={styles.productImages}>
                                <h4 className={styles.detailsHeading}>
                                  Product Images
                                </h4>
                                <div className={styles.imageGallery}>
                                  {product.images.map((image, index) => (
                                    <div
                                      key={index}
                                      className={styles.imageThumb}
                                      onClick={(e) =>
                                        handleShowImage(
                                          formatImageUrl(image),
                                          e
                                        )
                                      }
                                    >
                                      <img
                                        src={formatImageUrl(image)}
                                        alt={`${product.name} - image ${
                                          index + 1
                                        }`}
                                      />
                                      <div className={styles.imageOverlay}>
                                        <FiImage />
                                        <span>View</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className={styles.productAttributes}>
                              <div className={styles.attributeItem}>
                                <span className={styles.attributeLabel}>
                                  Dimensions:
                                </span>
                                <span className={styles.attributeValue}>
                                  {product.dimensions &&
                                  Array.isArray(product.dimensions)
                                    ? product.dimensions.join(" x ")
                                    : product.specifications?.size ||
                                      "Not specified"}
                                </span>
                              </div>
                              <div className={styles.attributeItem}>
                                <span className={styles.attributeLabel}>
                                  Colors:
                                </span>
                                <div className={styles.colorOptions}>
                                  {product.color_options &&
                                    product.color_options.map((color) => (
                                      <span
                                        key={color}
                                        className={styles.colorOption}
                                        style={{
                                          backgroundColor: color.toLowerCase(),
                                        }}
                                        title={color}
                                      ></span>
                                    ))}
                                </div>
                              </div>
                              <div className={styles.attributeItem}>
                                <span className={styles.attributeLabel}>
                                  Lead Time:
                                </span>
                                <span className={styles.attributeValue}>
                                  {product.lead_time_days ||
                                    product.lead_time ||
                                    "Contact for lead time"}
                                </span>
                              </div>
                              <div className={styles.attributeItem}>
                                <span className={styles.attributeLabel}>
                                  Minimum Order:
                                </span>
                                <span className={styles.attributeValue}>
                                  {product.minimum_order ||
                                    product.min_order_quantity ||
                                    1}{" "}
                                  units
                                </span>
                              </div>

                              {/* Additional Specifications */}
                              {product.specifications &&
                                Object.keys(product.specifications).length >
                                  0 && (
                                  <>
                                    <h4 className={styles.detailsHeading}>
                                      Specifications
                                    </h4>
                                    {Object.entries(product.specifications).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className={styles.attributeItem}
                                        >
                                          <span
                                            className={styles.attributeLabel}
                                          >
                                            {key.charAt(0).toUpperCase() +
                                              key.slice(1)}
                                            :
                                          </span>
                                          <span
                                            className={styles.attributeValue}
                                          >
                                            {value}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </>
                                )}

                              {/* Stock Information */}
                              <div className={styles.stockInfo}>
                                <div className={styles.attributeItem}>
                                  <span className={styles.attributeLabel}>
                                    Availability:
                                  </span>
                                  <span
                                    className={`${styles.attributeValue} ${
                                      product.in_stock
                                        ? styles.inStock
                                        : styles.outOfStock
                                    }`}
                                  >
                                    {product.in_stock
                                      ? "In Stock"
                                      : "Out of Stock"}
                                  </span>
                                </div>
                                {product.in_stock && product.stock_quantity && (
                                  <div className={styles.attributeItem}>
                                    <span className={styles.attributeLabel}>
                                      Stock Quantity:
                                    </span>
                                    <span className={styles.attributeValue}>
                                      {product.stock_quantity}{" "}
                                      {product.unit || "units"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Removed productActions div with Inquire and Request Quote buttons */}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noVendorSelected}>
                <p>Select a vendor to view their products</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      <Modal
        show={showAddVendorModal}
        onHide={() => setShowAddVendorModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5>Available Vendors</h5>
            <p className="text-muted">
              Select vendors to add to your connections
            </p>

            {/* <Button
              variant="outline-secondary"
              className="mb-3"
              onClick={() => setRefreshing((prev) => !prev)}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "spin-animation" : ""} />
              Refresh List
            </Button> */}

            {getAvailableVendors().length === 0 ? (
              <div className="alert alert-info">
                No new vendors available to connect with. All vendors are
                already in your connections.
              </div>
            ) : (
              <div className="row">
                {getAvailableVendors().map((vendor) => (
                  <div key={vendor.id} className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="d-flex">
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                            style={{ width: "48px", height: "48px" }}
                          >
                            {vendor.avatar ? (
                              <img
                                src={vendor.avatar}
                                alt={vendor.name}
                                className="rounded-circle w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              vendor.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h5 className="mb-1">{vendor.name}</h5>
                            <p className="text-muted mb-0">{vendor.contact}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="d-flex flex-wrap mb-2">
                            <span className="fw-bold me-2">Materials:</span>
                            {(vendor.materials || []).map((material) => (
                              <span
                                key={material}
                                className="badge bg-light text-dark me-1 mb-1"
                              >
                                {material}
                              </span>
                            ))}
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="me-2">Rating:</span>
                            <div className="text-warning">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                  {i < Math.floor(vendor.rating) ? "★" : "☆"}
                                </span>
                              ))}
                            </div>
                            <span className="ms-1">({vendor.rating})</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer bg-white border-top-0">
                        <Button
                          variant="primary"
                          className="w-100"
                          onClick={() => addVendorConnection(vendor.id)}
                          disabled={addingVendor}
                        >
                          <FiUserPlus className="me-2" />
                          Add to My Vendors
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddVendorModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Product Image Modal */}
      <Modal
        show={showProductImageModal}
        onHide={() => setShowProductImageModal(false)}
        size="lg"
        centered
        className={styles.imageModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Product Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.fullImage}>
            <img src={selectedImage} alt="Product" />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Vendors;
