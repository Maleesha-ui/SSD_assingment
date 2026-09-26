/**
 * Strict DTO Whitelist Validation Middleware
 * Invariant: Whitelist true, forbidNonWhitelisted true.
 * Any unexpected or unwhitelisted field is rejected with 400 Bad Request.
 */

const validateDto = (schema) => {
  return (req, res, next) => {
    const { allowedFields, requiredFields = [], validators = {} } = schema;
    const bodyKeys = Object.keys(req.body || {});

    // 1. Forbid Non-Whitelisted Fields
    for (const key of bodyKeys) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({
          message: `Field '${key}' is not allowed or unrecognized.`,
          error: 'FORBIDDEN_FIELD',
          field: key,
        });
      }
    }

    // 2. Check Required Fields
    for (const reqField of requiredFields) {
      const val = req.body[reqField];
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        return res.status(400).json({
          message: `Field '${reqField}' is required.`,
          error: 'MISSING_REQUIRED_FIELD',
          field: reqField,
        });
      }
    }

    // 3. Custom Field Validators
    for (const [field, validatorFn] of Object.entries(validators)) {
      if (req.body[field] !== undefined) {
        const errorMsg = validatorFn(req.body[field], req.body);
        if (errorMsg) {
          return res.status(400).json({
            message: errorMsg,
            error: 'VALIDATION_FAILED',
            field,
          });
        }
      }
    }

    next();
  };
};

// DTO Schemas
const publicRegisterDto = {
  allowedFields: ['name', 'fullName', 'email', 'password', 'phone', 'address'],
  requiredFields: ['email', 'password'],
  validators: {
    email: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Invalid email address format.';
      return null;
    },
    password: (val) => {
      if (typeof val !== 'string' || val.length < 8) {
        return 'Password must be at least 8 characters long.';
      }
      return null;
    },
    name: (val, body) => {
      if (!val && !body.fullName) return 'Name or fullName is required.';
      return null;
    },
  },
};

const createFuneralStaffDto = {
  allowedFields: [
    'fullName',
    'email',
    'phone',
    'dateOfBirth',
    'employeeId',
    'department',
    'branch',
    'hireDate',
    'employmentType',
    'certifications',
    'emergencyContact',
    'shift',
    'password',
  ],
  requiredFields: [
    'fullName',
    'email',
    'employeeId',
    'department',
    'branch',
    'hireDate',
    'employmentType',
    'shift',
  ],
  validators: {
    email: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Invalid email address format.';
      return null;
    },
    employmentType: (val) => {
      if (!['full-time', 'part-time', 'contract'].includes(val)) {
        return 'Employment type must be full-time, part-time, or contract.';
      }
      return null;
    },
    shift: (val) => {
      if (!['morning', 'evening', 'night', 'rotating'].includes(val)) {
        return 'Shift must be morning, evening, night, or rotating.';
      }
      return null;
    },
    certifications: (val) => {
      if (val && Array.isArray(val)) {
        for (const cert of val) {
          if (!cert.name) return 'Each certification must have a name.';
          if (cert.expiry && new Date(cert.expiry) <= new Date()) {
            return `Certification '${cert.name}' expiry date must be in the future.`;
          }
        }
      }
      return null;
    },
  },
};

const createHearseDriverDto = {
  allowedFields: [
    'fullName',
    'email',
    'phone',
    'dateOfBirth',
    'employeeId',
    'licenseNumber',
    'licenseClass',
    'licenseExpiry',
    'medicalCertificateExpiry',
    'backgroundCheckDate',
    'assignedVehicleId',
    'availabilitySchedule',
    'emergencyContact',
    'password',
  ],
  requiredFields: [
    'fullName',
    'email',
    'employeeId',
    'licenseNumber',
    'licenseClass',
    'licenseExpiry',
    'medicalCertificateExpiry',
  ],
  validators: {
    email: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Invalid email address format.';
      return null;
    },
    licenseExpiry: (val) => {
      if (!val || isNaN(new Date(val).getTime())) return 'Invalid licenseExpiry date.';
      if (new Date(val) <= new Date()) {
        return 'License expiry date must be in the future.';
      }
      return null;
    },
    medicalCertificateExpiry: (val) => {
      if (!val || isNaN(new Date(val).getTime())) return 'Invalid medicalCertificateExpiry date.';
      if (new Date(val) <= new Date()) {
        return 'Medical certificate expiry date must be in the future.';
      }
      return null;
    },
  },
};

const createFuneralManagerDto = {
  allowedFields: [
    'fullName',
    'email',
    'phone',
    'dateOfBirth',
    'employeeId',
    'managedBranch',
    'reportingTo',
    'hireDate',
    'yearsOfExperience',
    'managementCertifications',
    'emergencyContact',
    'password',
  ],
  requiredFields: [
    'fullName',
    'email',
    'employeeId',
    'managedBranch',
    'reportingTo',
    'yearsOfExperience',
  ],
  validators: {
    email: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Invalid email address format.';
      return null;
    },
    yearsOfExperience: (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        return 'Years of experience must be a non-negative integer.';
      }
      return null;
    },
  },
};

const createAdminDto = {
  allowedFields: [
    'fullName',
    'email',
    'phone',
    'dateOfBirth',
    'employeeId',
    'accessTier',
    'managedBranch',
    'reportingTo',
    'hireDate',
    'yearsOfExperience',
    'managementCertifications',
    'emergencyContact',
    'password',
    'stepUpToken',
  ],
  requiredFields: ['fullName', 'email', 'employeeId', 'accessTier'],
  validators: {
    email: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Invalid email address format.';
      return null;
    },
    accessTier: (val) => {
      if (!['super_admin', 'ops_admin', 'support_admin'].includes(val)) {
        return 'Access tier must be super_admin, ops_admin, or support_admin.';
      }
      return null;
    },
  },
};

const createInviteDto = {
  allowedFields: ['email', 'role', 'seedData'],
  requiredFields: ['email', 'role'],
  validators: {
    email: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Invalid email address format.';
      return null;
    },
    role: (val) => {
      const validRoles = [
        'funeral_staff',
        'hearse_driver',
        'funeral_manager',
        'admin',
        'staff',
        'driver',
        'manager',
      ];
      if (!validRoles.includes(val)) {
        return `Role must be one of: ${validRoles.join(', ')}`;
      }
      return null;
    },
  },
};

const VALID_USER_ROLES = [
  'customer',
  'funeral_staff',
  'hearse_driver',
  'funeral_manager',
  'admin',
  'staff',
  'driver',
  'manager',
];

const ALLOWED_DIRECTORY_PARAMS = ['role', 'branch', 'status', 'q', 'page', 'limit', 'sort'];
const ALLOWED_SORT_FIELDS = ['createdAt', 'name', 'fullName', 'role', '-createdAt', '-name', '-fullName', '-role'];

/**
 * Directory Query Hardening Middleware (V10 Remediation)
 * - Invariant 11: Pagination is enforced, max limit 100
 * - Whitelists query parameters; unknown params rejected with 400
 * - Whitelists sort fields; invalid sort rejected with 400
 * - Validates role enum; invalid role rejected with 400
 */
const validateDirectoryQuery = (req, res, next) => {
  const queryKeys = Object.keys(req.query || {});

  // 1. Whitelist query parameters
  for (const key of queryKeys) {
    if (!ALLOWED_DIRECTORY_PARAMS.includes(key)) {
      return res.status(400).json({
        message: `Query parameter '${key}' is unrecognized or not allowed.`,
        error: 'INVALID_QUERY_PARAMETER',
        field: key,
      });
    }
  }

  // 2. Validate role if supplied
  if (req.query.role && !VALID_USER_ROLES.includes(req.query.role)) {
    return res.status(400).json({
      message: `Invalid role filter '${req.query.role}'. Must be one of: ${VALID_USER_ROLES.join(', ')}`,
      error: 'INVALID_ROLE_FILTER',
    });
  }

  // 3. Validate sort if supplied
  if (req.query.sort && !ALLOWED_SORT_FIELDS.includes(req.query.sort)) {
    return res.status(400).json({
      message: `Invalid sort field '${req.query.sort}'. Allowed: createdAt, name, fullName, role`,
      error: 'INVALID_SORT_FIELD',
    });
  }

  // 4. Validate and cap pagination
  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = 20;
  } else if (limit > 100) {
    limit = 100; // Cap limit at 100 (Invariant 11)
  }

  req.sanitizedQuery = {
    ...req.query,
    page,
    limit,
    sort: req.query.sort || '-createdAt',
  };

  next();
};

const selfUpdateUserDto = {
  allowedFields: ['name', 'fullName', 'phone', 'address', 'avatar'],
  requiredFields: [],
  validators: {
    name: (val) => {
      if (typeof val !== 'string' || val.trim().length === 0) return 'Name cannot be empty.';
      return null;
    },
  },
};

const adminUpdateUserDto = {
  allowedFields: ['name', 'fullName', 'phone', 'address', 'avatar', 'status', 'isProfileComplete'],
  requiredFields: [],
  validators: {
    status: (val) => {
      if (val && !['active', 'pending_invite', 'suspended'].includes(val)) {
        return 'Status must be active, pending_invite, or suspended.';
      }
      return null;
    },
  },
};

module.exports = {
  validateDto,
  publicRegisterDto,
  createFuneralStaffDto,
  createHearseDriverDto,
  createFuneralManagerDto,
  createAdminDto,
  createInviteDto,
  validateDirectoryQuery,
  selfUpdateUserDto,
  adminUpdateUserDto,
};
