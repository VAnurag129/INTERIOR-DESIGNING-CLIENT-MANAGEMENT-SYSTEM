const BASE_URL = "http://localhost:5005";

const api = {
  login: async (email, password, role) => {
    try {
      const res = await fetch(`${BASE_URL}/credentials`);
      const credentials = await res.json();
      // console.log(`${role} from api login`);

      const user = credentials.find(
        (u) => u.email === email && u.password === password && u.role === role
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const userId = user.id;

      // Updated path for role-based user details
      const detailsRes = await fetch(
        `${BASE_URL}/credentials/${role}/${userId}`
      );
      if (!detailsRes.ok) {
        throw new Error("User details not found");
      }

      const details = await detailsRes.json();

      return {
        success: true,
        username: details.name,
        userId: details.id,
        role: role,
        details: details,
      };
    } catch (error) {
      throw error;
    }
  },

  // Register a new client (signup)
  clientSignup: async ({ email, password }) => {
    // This will PATCH the credentials entry for the client
    const response = await fetch(`${BASE_URL}/credentials`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "client" }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Signup failed");
    }
    return await response.json();
  },

  // Register Designer
  registerDesigner: async (designerData, password) => {
    if (!designerData.id) designerData.id = `designer_${Date.now()}`;
    // 1. Create designer
    const res = await fetch(`${BASE_URL}/designers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(designerData),
    });
    if (!res.ok) throw new Error("Failed to register designer");
    // 2. Create credentials with name
    const credRes = await fetch(`${BASE_URL}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: designerData.id,
        email: designerData.email,
        password,
        role: "designer",
        name: designerData.name, // Add name here
      }),
    });
    if (!credRes.ok) throw new Error("Failed to create designer credentials");
    return { success: true, designer: await res.json() };
  },

  // Register Vendor
  registerVendor: async (vendorData, password) => {
    if (!vendorData.id) vendorData.id = `vendor_${Date.now()}`;
    // 1. Create vendor
    const res = await fetch(`${BASE_URL}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorData),
    });
    if (!res.ok) throw new Error("Failed to register vendor");
    // 2. Create credentials with name
    const credRes = await fetch(`${BASE_URL}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: vendorData.id,
        email: vendorData.email,
        password,
        role: "vendor",
        name: vendorData.name, // Add name here
      }),
    });
    if (!credRes.ok) throw new Error("Failed to create vendor credentials");
    return { success: true, vendor: await res.json() };
  },

  getData: async (resourceType, id = "") => {
    // Updated path for generic resource
    const path = id
      ? `${BASE_URL}/resources/${resourceType}/${id}`
      : `${BASE_URL}/${resourceType}`;

    const res = await fetch(path);
    if (!res.ok) {
      throw new Error("Resource not found");
    }
    return await res.json();
  },

  getUserData: async (userId, userRole) => {
    const result = {
      credentials: [],
      projects: [],
      clients: [],
      vendors: [],
      conversations: [],
      schedules: [],
      designers: [],
      orders: [],
      products: [],
    };

    const fetchAll = async (endpoint) => {
      const res = await fetch(`${BASE_URL}/${endpoint}`);
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      return await res.json();
    };

    try {
      switch (userRole) {
        case "designer": {
          const [
            projectsData,
            clientsData,
            vendorsData,
            designersData,
            conversationsData,
            schedulesData,
            ordersData,
          ] = await Promise.all([
            fetchAll("projects"),
            fetchAll("clients"),
            fetchAll("vendors"),
            fetchAll("designers"),
            fetchAll("conversations"),
            fetchAll("schedules"),
            fetchAll("orders"),
          ]);

          result.projects = projectsData.filter(
            (p) => p.designer_id === userId
          );

          result.clients = clientsData.filter((c) => c.designer_id === userId);

          const currentDesigner = designersData.find((d) => d.id === userId);
          result.vendors = vendorsData.filter((v) =>
            currentDesigner?.vendor_connections?.includes(v.id)
          );

          result.conversations = conversationsData.filter((c) =>
            c.participants.includes(userId)
          );
          result.orders = ordersData.filter((o) => o.designer_id === userId);
          result.schedules = schedulesData.filter(
            (s) => s.designer_id === userId
          );
          break;
        }

        case "client": {
          const [
            projectsData,
            conversationsData,
            schedulesData,
            designersData,
          ] = await Promise.all([
            fetchAll("projects"),
            fetchAll("conversations"),
            fetchAll("schedules"),
            fetchAll("designers"),
          ]);

          result.projects = projectsData.filter((p) => p.client_id === userId);
          result.conversations = conversationsData.filter((c) =>
            c.participants.includes(userId)
          );
          result.schedules = schedulesData.filter(
            (s) => s.client_id === userId
          );
          const uniqueDesignerIds = [
            ...new Set(result.projects.map((p) => p.designer_id)),
          ];
          result.designers = uniqueDesignerIds.map((did) =>
            designersData.find((c) => c.id === did)
          );
          break;
        }

        case "vendor": {
          const [
            conversationsData,
            productsData,
            schedulesData,
            designersData,
          ] = await Promise.all([
            fetchAll("conversations"),
            fetchAll("products"),
            fetchAll("schedules"),
            fetchAll("designers"),
          ]);

          result.conversations = conversationsData.filter((c) =>
            c.participants.includes(userId)
          );
          result.products = productsData.filter((p) => p.vendor_id === userId);
          result.schedules = schedulesData.filter(
            (s) => s.vendor_id === userId
          );
          result.designers = designersData.filter((d) =>
            d.vendor_connections?.includes(userId)
          );
          console.log(result);
          break;
        }

        case "admin": {
          const [
            credentialsData,
            designersData,
            clientsData,
            vendorsData,
            schedulesData,
          ] = await Promise.all([
            fetchAll("credentials"),
            fetchAll("designers"),
            fetchAll("clients"),
            fetchAll("vendors"),
            fetchAll("schedules"),
          ]);

          result.credentials = credentialsData;
          result.designers = designersData;
          result.clients = clientsData;
          result.vendors = vendorsData;
          result.schedules = schedulesData;
          console.log(result);
          break;
        }

        default:
          throw new Error(`Invalid role: ${userRole}`);
      }

      console.log(result);
      return result;
    } catch (err) {
      console.error("❌ Error in getUserData:", err);
      throw err;
    }
  },

  // Add a new project
  addProject: async (projectData) => {
    try {
      // Generate a unique ID if not provided
      if (!projectData.id) {
        projectData.id = `project_${Date.now()}`;
      }

      const response = await fetch(`${BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error("Failed to add project");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  },

  // Updating project details
  updateProject: async (projectId, updatedData) => {
    try {
      const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  // Delete a project by ID
  deleteProject: async (projectId) => {
    try {
      const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  // Add a new client (designer invites client)
  addClient: async (clientData) => {
    try {
      // Generate a unique ID if not provided
      if (!clientData.id) {
        clientData.id = `client_${Date.now()}`;
      }

      console.log(clientData);

      // 1. Add client to clients collection
      const response = await fetch(`${BASE_URL}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Failed to add client");
      }
      const clientRes = await response.json();
      const client = clientRes.data; // <-- get the actual client object

      // 2. Add client to credentials collection (without password)
      // Only add if not already present
      const credRes = await fetch(`${BASE_URL}/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: client.id,
          email: client.email,
          name: client.name,
          role: "client",
          // No password at this stage
        }),
      });

      // It's OK if already exists (409), but throw for other errors
      if (!credRes.ok && credRes.status !== 409) {
        throw new Error("Failed to add client credentials");
      }

      return client;
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  },

  // Update designer vendor connections
  addVendorConnection: async (designerId, vendorId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/designers/${designerId}/vendor-connections`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vendorId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vendor connection");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating vendor connection:", error);
      throw error;
    }
  },

  // Get all available vendors (for the add vendor modal)
  getAllVendors: async () => {
    try {
      const response = await fetch(`${BASE_URL}/vendors`);

      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error;
    }
  },

  // Delete a designer by ID
  deleteDesigner: async (designerId) => {
    try {
      const response = await fetch(`${BASE_URL}/designers/${designerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete designer");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting designer:", error);
      throw error;
    }
  },

  // Delete a vendor by ID
  deleteVendor: async (vendorId) => {
    try {
      const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete vendor");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      throw error;
    }
  },

  // Delete a client by ID
  deleteClient: async (clientId) => {
    try {
      const response = await fetch(`${BASE_URL}/clients/${clientId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete client");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  },

  addSchedule: async (scheduleData) => {
    try {
      const response = await fetch(`${BASE_URL}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });
      if (!response.ok) {
        throw new Error("Failed to add schedule");
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding schedule:", error);
      throw error;
    }
  },

  updateSchedule: async (scheduleId, updatedData) => {
    try {
      const response = await fetch(`${BASE_URL}/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  },

  deleteSchedule: async (scheduleId) => {
    try {
      const response = await fetch(`${BASE_URL}/schedules/${scheduleId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  },

  addMessageToConversation: async (conversationId, messageObj) => {
    try {
      const response = await fetch(
        `${BASE_URL}/conversations/${conversationId}/messages`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageObj),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add message");
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  },

  updateDesigner: async (designerId, updatedData) => {
    // Update designer in designers collection
    const response = await fetch(`${BASE_URL}/designers/${designerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update designer");

    // Update designer in credentials collection
    // const credRes = await fetch(
    //   `${BASE_URL}/credentials/designer/${designerId}`,
    //   {
    //     method: "PATCH",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(updatedData),
    //   }
    // );
    // if (!credRes.ok) throw new Error("Failed to update designer credentials");

    return await response.json();
  },

  updateVendor: async (vendorId, updatedData) => {
    // Update vendor in vendors collection
    const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update vendor");

    // Update vendor in credentials collection
    // const credRes = await fetch(`${BASE_URL}/credentials/vendor/${vendorId}`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(updatedData),
    // });
    // if (!credRes.ok) throw new Error("Failed to update vendor credentials");

    // return await response.json();
  },

  updateClient: async (clientId, updatedData) => {
    // Update client in clients collection
    const response = await fetch(`${BASE_URL}/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update client");

    return await response.json();
  },
};

export default api;
