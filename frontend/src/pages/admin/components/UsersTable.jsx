import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  Box,
  Button,
  useTheme
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import api from '../../../services/api';

const UsersTable = ({ users, onExportPdf }) => {
  const theme = useTheme();

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      // Refresh data if needed
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={onExportPdf}
          sx={{ bgcolor: theme.palette.error.main, '&:hover': { bgcolor: theme.palette.error.dark } }}
        >
          Export PDF
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Join Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UsersTable; 