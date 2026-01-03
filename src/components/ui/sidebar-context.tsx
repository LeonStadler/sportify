import * as React from "react";

export type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  buttonClickedRef: React.MutableRefObject<boolean>;
  expectedStateRef: React.MutableRefObject<boolean | null>;
};

export const SidebarContext = React.createContext<SidebarContext | null>(null);

