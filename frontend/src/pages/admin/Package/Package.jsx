import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  useTheme,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Grid,
  Divider,
  Stack
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "../../../services/api";

const PackageAdmin = () => {
  const theme = useTheme();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [reportType, setReportType] = useState("pdf");
  const [reportLoading, setReportLoading] = useState(false);

  // Package edit/create state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [currentPackage, setCurrentPackage] = useState({
    name: "",
    price: 0,
    description: "",
    services: [],
  });
  const [currentService, setCurrentService] = useState("");

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await api.get("/admin/package/get-all-packages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Packages:", response.data);
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError("Failed to load package data");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter packages based on search term and price filter
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPrice = true;
    if (priceFilter === "low") {
      matchesPrice = pkg.price < 25000;
    } else if (priceFilter === "medium") {
      matchesPrice = pkg.price >= 40000 && pkg.price < 75000;
    } else if (priceFilter === "high") {
      matchesPrice = pkg.price >= 75000;
    }

    return matchesSearch && matchesPrice;
  });

  // Open dialog for creating a new package
  const handleAddPackage = () => {
    setCurrentPackage({
      name: "",
      price: 0,
      description: "",
      services: [],
    });
    setDialogAction("add");
    setOpenDialog(true);
  };

  // Open dialog for editing a package
  const handleEditPackage = (pkg) => {
    setCurrentPackage({ ...pkg });
    setDialogAction("edit");
    setOpenDialog(true);
  };

  // Handle package form changes
  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      setCurrentPackage({ ...currentPackage, [name]: parseInt(value) || 0 });
    } else {
      setCurrentPackage({ ...currentPackage, [name]: value });
    }
  };

  // Add service to package
  const handleAddService = () => {
    if (currentService.trim()) {
      setCurrentPackage({
        ...currentPackage,
        services: [...currentPackage.services, currentService.trim()],
      });
      setCurrentService("");
    }
  };

  // Remove service from package
  const handleRemoveService = (index) => {
    const newServices = [...currentPackage.services];
    newServices.splice(index, 1);
    setCurrentPackage({ ...currentPackage, services: newServices });
  };

  // Save package (create or update)
  const handleSavePackage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let response;

      if (dialogAction === "add") {
        response = await api.post(
          "/admin/package/new-package",
          currentPackage,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Package added successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        response = await api.put(
          `/admin/package/update-package/${currentPackage._id}`,
          currentPackage,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setOpenDialog(false);
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      setError(
        `Failed to ${dialogAction === "add" ? "create" : "update"} package`
      );
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  // Delete package
  const handleDeletePackage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/admin/package/${packageToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `Package "${packageToDelete.name}" has been deleted`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setDeleteDialogOpen(false);
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      setError("Failed to delete package");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const generateReport = () => {
    setReportLoading(true);
    try {
      if (reportType === "pdf") {
        generatePdfReport();
      } else if (reportType === "excel") {
        generateExcelReport();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const generatePdfReport = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Funeral Service Packages Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Create the table data
    const tableColumn = [
      "Name",
      "Price (₹)",
      "Description",
      "Services",
      "Date Created",
    ];
    const tableRows = filteredPackages.map((pkg) => [
      pkg.name,
      pkg.price.toLocaleString(),
      pkg.description.substring(0, 40) +
        (pkg.description.length > 40 ? "..." : ""),
      pkg.services.join(", "),
      new Date(pkg.createdAt).toLocaleDateString(),
    ]);

    // Generate the table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    // Save the PDF
    doc.save("packages-report.pdf");
  };

  const generateExcelReport = () => {
    // Prepare data for Excel
    const excelData = filteredPackages.map((pkg) => ({
      "Package Name": pkg.name,
      "Price (₹)": pkg.price,
      Description: pkg.description,
      Services: pkg.services.join(", "),
      "Created Date": new Date(pkg.createdAt).toLocaleDateString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Packages");

    // Generate Excel file
    XLSX.writeFile(workbook, "packages-report.xlsx");
  };

  if (loading && packages.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        bgcolor: theme.palette.grey[100],
        p: 4,
        overflow: "auto",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => window.history.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
        >
          Package Management
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
            >
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="excel">Excel Report</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={reportType === "pdf" ? <PdfIcon /> : <ExcelIcon />}
            onClick={generateReport}
            disabled={reportLoading || filteredPackages.length === 0}
          >
            {reportLoading ? "Generating..." : "Generate Report"}
          </Button>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Price Range</InputLabel>
            <Select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              label="Price Range"
            >
              <MenuItem value="all">All Prices</MenuItem>
              <MenuItem value="low">Low (Under 25,000)</MenuItem>
              <MenuItem value="medium">Medium (40,000 - 75,000)</MenuItem>
              <MenuItem value="high">High (Above 75,000)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPackages}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPackage}
            sx={{ ml: "auto" }}
          >
            Add Package
          </Button>
        </Box>
      </Paper>

      {/* Packages Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Services</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Date Created</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPackages
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pkg) => (
                  <TableRow key={pkg._id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{pkg.name}</Typography>
                    </TableCell>
                    <TableCell>{pkg.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography>{pkg.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {pkg.services.map((service, index) => (
                          <Chip
                            key={index}
                            label={service}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditPackage(pkg)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(pkg)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPackages.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {filteredPackages.length === 0 && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={200}
        >
          <Typography variant="h6" color="text.secondary">
            No packages found matching your criteria
          </Typography>
        </Box>
      )}

      {/* Create/Edit Package Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogAction === "add" ? "Create New Package" : "Edit Package"}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Package Name"
                name="name"
                value={currentPackage.name}
                onChange={handlePackageChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={currentPackage.price}
                onChange={handlePackageChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"></InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentPackage.description}
                onChange={handlePackageChange}
                margin="normal"
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Services Included
              </Typography>
              <Box sx={{ display: "flex", mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add a service"
                  value={currentService}
                  onChange={(e) => setCurrentService(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddService}
                  sx={{ ml: 1 }}
                >
                  Add
                </Button>
              </Box>
              <Paper
                variant="outlined"
                sx={{ p: 2, maxHeight: 200, overflow: "auto" }}
              >
                {currentPackage.services.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {currentPackage.services.map((service, index) => (
                      <Chip
                        key={index}
                        label={service}
                        onDelete={() => handleRemoveService(index)}
                        color="primary"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center">
                    No services added yet
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePackage}
            disabled={
              !currentPackage.name ||
              currentPackage.price <= 0 ||
              !currentPackage.description
            }
          >
            {dialogAction === "add" ? "Create Package" : "Update Package"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the package "{packageToDelete?.name}
            "? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeletePackage}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PackageAdmin;
