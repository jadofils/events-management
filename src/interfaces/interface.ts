// Interface for Users
export interface UserInterface {
  UserID: string;
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Password?: string;
  PhoneNumber?: string;
}

// Interface for Roles
export interface RoleInterface {
  RoleID: string;
  RoleName: string;
  Permissions: string[];
  Description?: string;
}

// Interface for Organizations
export interface OrganizationInterface {
  OrganizationID: string;
  OrganizationName: string;
  Description: string;
  ContactEmail: string;
  ContactPhone?: string;
  IsExternal: boolean;
  Address: string;
  OrganizationType: string;
}

// Interface for Venues
export interface VenueInterface {
  VenueID: string;
  VenueName: string;
  Capacity: number;
  Location: string;
}

// Interface for Events
export interface EventInterface {
  EventID: string;
  EventTitle: string;
  Description: string;
  EventCategory: string;
  EventType: "public" | "private";
}

// Interface for EventBooking
export interface EventBookingInterface {
  BookingID: string;
  EventID: string;
  VenueID: string;
  OrganizerID: string;
  OrganizationID: string;
  StartDate: Date;
  EndDate: Date;
  StartTime: string;
  EndTime: string;
  ApprovalStatus: string;
}

// Interface for EventResources
export interface EventResourceInterface {
  EventResourceID: string;
  EventID: string;
  ResourceID: string;
  Quantity: number;
  AmountSpent: number;
}

// Interface for Resources
export interface ResourceInterface {
  ResourceID: string;
  ResourceName: string;
  Description: string;
  CostPerUnit: number;
}

// Interface for Registrations
export interface RegistrationInterface {
  RegistrationID: string;
  EventID: string;
  UserID: string;
  RegistrationDate: Date;
  TicketType: string;
  PaymentStatus: string;
  QRCode: string;
  CheckDate?: Date;
  Attended?: boolean;
}

// Interface for Feedback
export interface FeedbackInterface {
  FeedbackID: string;
  EventID: string;
  UserID: string;
  Rating: number;
  Comments: string;
}

// Interface for Payments
export interface PaymentInterface {
  PaymentID: string;
  EventID: string;
  UserID: string;
  TicketTypeID: string;
  PaymentDate: Date;
  PaidAmount: number;
  RemainingAmount?: number;
  PaymentMethod: string;
  PaymentStatus: string;
  Description?: string;
}

// Interface for TicketTypes
export interface TicketTypeInterface {
  TicketTypeID: string;
  TicketName: string;
  Price: number;
  Description?: string;
}

// Interface for Notifications
export interface NotificationInterface {
  NotificationID: string;
  UserID: string;
  EventID: string;
  Message: string;
  SentAt: Date;
  IsDisabled?: boolean;
  IsRead?: boolean;
}

// Interface for Budgets
export interface BudgetInterface {
  BudgetID: string;
  EventID: string;
  ExpectedAmount: number;
  Income: number;
  Expenditure: number;
  Notes: string;
}

// Interface for UserRoles (Many-to-Many)
export interface UserRoleInterface {
  UserID: string;
  RoleID: string;
}

// Interface for OrganizationUsers (Many-to-Many)
export interface OrganizationUserInterface {
  UserID: string;
  OrganizationID: string;
}


export interface OrganizationUserInterface {
  id: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserInterface;
  organization: OrganizationInterface;
}

export interface OrganizationUserWithRelationsInterface extends OrganizationUserInterface {
  user: UserInterface & {
    roles: RoleInterface[];
  };
  organization: OrganizationInterface;
}