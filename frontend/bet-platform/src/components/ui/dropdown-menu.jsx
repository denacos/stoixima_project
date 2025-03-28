// 📁 src/components/ui/dropdown-menu.jsx
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = DropdownMenuPrimitive.Content;
export const DropdownMenuItem = DropdownMenuPrimitive.Item;
export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

// Μπορείς να επεκτείνεις αυτό το αρχείο με στυλ Tailwind αν θέλεις
// παράδειγμα:
// <DropdownMenuItem className="px-3 py-2 text-sm hover:bg-gray-100" />
