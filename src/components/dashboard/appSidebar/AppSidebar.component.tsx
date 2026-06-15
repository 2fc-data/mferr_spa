/**
 * @copyright 2025 2FC.Data
 * @license Apache-2.0
 */

/**
 * Custom modules
 */
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/dashboard/userMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * Hooks
 */
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Assets
 */
import { LogOutIcon, ChevronsUpDown, Briefcase, ShieldCheck, HomeIcon } from "lucide-react";

/**
 * Constantes
 */
import { APP_SIDEBAR } from "@/lib/constants/";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react";

export const AppSidebar = () => {
  const { isMobile, state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.profiles?.some((p: any) => p.id === 1);
  const isManager = currentUser?.profiles?.some((p: any) => p.id === 2);
  const [activeContext, setActiveContext] = useState<'operacional' | 'administrativo'>('administrativo');

  useEffect(() => {
    if (isMobile && state === 'expanded') {
      toggleSidebar();
    }
  }, [isMobile, state, toggleSidebar]);

  const handleLogout = () => {
    authService.logout();
  }

  const userRules: string[] = currentUser?.rules || [];

  const filterByRoleAndProfile = (items: Array<{ title: string; url: string; Icon: any; requiredRule?: string | null }>) =>
    items.filter(item => {
      // 1. Check rules first (as before)
      const hasRule = !item.requiredRule || userRules.includes(item.requiredRule);
      if (!hasRule) return false;

      // 2. Apply profile-specific restrictions if not Admin
      if (isAdmin) return true;

      // Dashboard (url: '/Dashboard') is strictly for Admin
      if (item.url === '/Dashboard') return false;

      if (isManager) {
        // Gerente: somente Usuários
        return item.url === '/Dashboard/users';
      }

      return true;
    });

  const navAdministrativa = filterByRoleAndProfile(APP_SIDEBAR.primaryNav);
  const navOperacional = filterByRoleAndProfile(APP_SIDEBAR.adminNav);

  const handleContextChange = (newContext: 'operacional' | 'administrativo') => {
    setActiveContext(newContext);
    const navItems = newContext === 'operacional' ? navOperacional : navAdministrativa;
    if (navItems.length > 0) {
      const targetItem = newContext === 'administrativo'
        ? navItems.find(item => item.title === 'CRM de Planejamento') || navItems[0]
        : navItems[0];
      navigate(targetItem.url);
    }
  };

  return (
    <Sidebar
      variant='floating'
      collapsible="icon"
      className="bg-background h-[calc(100vh-5rem)] top-21"
    >
      <TooltipProvider delayDuration={0}>
        {/* Sidebar Header */}
        <SidebarHeader>
          <Link to="/" className={cn(
            "flex items-center gap-3 w-full",
            state === 'collapsed' && !isMobile ? "justify-center" : ""
          )}>
            <HomeIcon className="size-4 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
            {state === 'expanded' || isMobile ? <span>Home</span> : null}
          </Link>
          <hr />
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size={state === 'expanded' ? "lg" : "default"}
                    className={cn(
                      "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border shadow-sm hover:bg-accent/5",
                      state === 'expanded' ? "mt-2 p-2" : "mt-2 justify-center"
                    )}
                  >
                    <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-primary text-foreground shadow-md border border-border/50">
                      {activeContext === 'operacional' ? <Briefcase className="size-4.5" /> : <ShieldCheck className="size-4.5" />}
                    </div>
                    {state === 'expanded' && (
                      <>
                        <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                          <span className="truncate font-bold">Menu</span>
                          <span className="truncate text-xs text-muted-foreground capitalize">
                            {activeContext === 'operacional' ? 'Operacional' : 'Administrativo'}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side={isMobile ? "bottom" : "right"}
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Alternar Contexto
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {navOperacional.length > 0 && (
                    <DropdownMenuItem
                      onClick={() => handleContextChange('operacional')}
                      className={cn("cursor-pointer", activeContext === 'operacional' && "bg-accent/10 font-medium")}
                    >
                      <div className="flex size-6 items-center justify-center rounded-md border bg-background mr-2">
                        <Briefcase className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">Operacional</span>
                        <span className="text-[10px] text-muted-foreground">Cadastros</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  {navAdministrativa.length > 0 && (
                    <DropdownMenuItem
                      onClick={() => handleContextChange('administrativo')}
                      className={cn("cursor-pointer", activeContext === 'administrativo' && "bg-accent/10 font-medium")}
                    >
                      <div className="flex size-6 items-center justify-center rounded-md border bg-background mr-2">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">Administrativo</span>
                        <span className="text-[10px] text-muted-foreground">Dashboards</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/** Sidebar Content */}
        <SidebarContent>
          <SidebarGroup>
            {state === 'expanded' && (
              <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {activeContext === 'operacional' ? 'Visão Operacional' : 'Visão Administrativa'}
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {(activeContext === 'operacional' ? navOperacional : navAdministrativa).map((item) => {
                  const isActive = item.url === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive} className={cn(
                        "transition-elegant cursor-pointer",
                        isActive ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary" : "text-foreground hover:bg-accent/10 hover:text-accent"
                      )} asChild>
                        <Link to={item.url} className="flex items-center gap-3 w-full">
                          <item.Icon className={cn("size-5", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" : "text-muted-foreground")} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Secondary Nav */}
          {/* {isMobile && ( 
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {APP_SIDEBAR.secondaryNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <Link to={item.url}>
                        <item.Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          )} */}

        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter className={cn((isMobile || state === 'collapsed') && 'border-t')}>
          <SidebarMenu>
            <SidebarMenuItem className={cn(
              "flex w-full flex-col p-2",
              (isMobile || state === 'collapsed')
                ? "items-center justify-center gap-4"
                : "items-stretch gap-2"
            )}>
              <div className={cn(
                "flex w-full",
                (isMobile || state === 'collapsed') ? "justify-center" : "justify-between items-center"
              )}>
                <UserMenu expanded={state === 'expanded' && !isMobile} />
              </div>

              {(state === 'expanded' || isMobile) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 mt-2 h-9 rounded-lg"
                >
                  <LogOutIcon className="size-4" />
                  <span>Sair da Conta</span>
                </Button>
              )}

              {state === 'collapsed' && !isMobile && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={handleLogout}
                      className="rounded-full size-8 mx-auto"
                    >
                      <LogOutIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sair</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </TooltipProvider>
    </Sidebar >
  )
}
