// ✅ UserToolsPanel.jsx (πλήρως ενημερωμένο με routing)

import {
  TicketIcon,
  RepeatIcon,
  BanknoteIcon,
  UserIcon,
  SettingsIcon,
  MessageSquareIcon,
  LogOutIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import { Button } from "./button";
import { Link } from "react-router-dom";

const UserToolsPanel = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-green-700 hover:bg-green-800">Εργαλεία</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
          Εργαλεία Χρήστη
        </div>

        <DropdownMenuItem asChild>
          <Link to="/bets" className="flex items-center gap-2 w-full">
            <TicketIcon className="w-4 h-4" /> Στοιχήματα
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/transactions" className="flex items-center gap-2 w-full">
            <RepeatIcon className="w-4 h-4" /> Μεταφορές
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/cashier" className="flex items-center gap-2 w-full">
            <BanknoteIcon className="w-4 h-4" /> Ταμεία
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2 w-full">
            <UserIcon className="w-4 h-4" /> Λογαριασμός
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2 w-full">
            <SettingsIcon className="w-4 h-4" /> Ρυθμίσεις
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/chat" className="flex items-center gap-2 w-full">
            <MessageSquareIcon className="w-4 h-4" /> Chat
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/logout" className="flex items-center gap-2 w-full">
            <LogOutIcon className="w-4 h-4" /> Αποσύνδεση
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserToolsPanel;
