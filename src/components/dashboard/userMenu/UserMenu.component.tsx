/**
 * @copyright 2025 Marcell Ferreira - Advocacia
 * @license Apache-2.0
 */

import { useState, useRef } from "react";
import Avatar from "react-avatar";
import { api, API_URL } from "@/services/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

/**
 * Assets
 */
import { UploadCloudIcon } from "lucide-react";

export const UserMenu = ({ expanded = false }: { expanded?: boolean }) => {
  const currentUser = useCurrentUser();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      console.log("Sending file to /users/me/avatar");
      // Because api.ts defaults to application/json, we MUST pass headers to let Axios correctly infer the boundary on FormData or override it.
      // Wait, passing 'multipart/form-data' without a boundary in Axios actually breaks it in some versions, 
      // but if the instance forces application/json, it might be sending json.
      // The best way to fix this in Axios when the base instance has application/json is to change Content-Type to `multipart/form-data`.
      const response = await api.postForm('/users/me/avatar', formData);
      console.log("Response:", response.data);

      if (response.data?.avatar_url) {
        // Update local session storage
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.avatar_url = response.data.avatar_url;
          sessionStorage.setItem('user', JSON.stringify(userObj));
          // Dispatch custom event to trigger app-wide re-render for avatar
          window.dispatchEvent(new Event('app:avatar-updated'));
        }
        toast.success("Foto de perfil atualizada!");
      } else {
        toast.error("Resposta sem avatar_url");
      }
    } catch (error: any) {
      console.error("Erro no upload do avatar", error);
      toast.error(`Erro: ${error?.response?.data?.message || 'Não foi possível atualizar'}`);
      alert(`API Error: ${error?.response?.status} - ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      {/* Hidden File Input for Avatar, outside of Dropdown components so it doesn't unmount! */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="avatar-upload"
        onChange={handleFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {expanded ? (
            <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left">
              <div className="relative">
                <Avatar
                  name={currentUser?.name ?? 'User'}
                  src={currentUser?.avatar_url ? `${API_URL}${currentUser.avatar_url}` : undefined}
                  size="36px"
                  round={true}
                />
                <div className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 dark:bg-emerald-400 ring-sidebar ring-1"></div>
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-semibold truncate">
                  {currentUser?.name ?? '—'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {currentUser?.email ?? '—'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar
                name={currentUser?.name ?? 'User'}
                src={currentUser?.avatar_url ? `${API_URL}${currentUser.avatar_url}` : undefined}
                size="36px"
                round={true}
              />
              <div className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 dark:bg-emerald-400 ring-sidebar ring-1"></div>
            </div>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="end"
          className="w-60"
        >
          <DropdownMenuGroup>
            {/* Avatar Upload Item */}
            <DropdownMenuItem
              className="cursor-pointer font-medium text-emerald-600 dark:text-emerald-400 p-0"
              disabled={isUploading}
              asChild
            >
              <label htmlFor="avatar-upload" className="flex items-center w-full px-2 py-1.5 cursor-pointer">
                <UploadCloudIcon className="size-4 mr-2" />
                <span>{isUploading ? 'Enviando…' : 'Trocar Foto de Perfil'}</span>
              </label>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuRadioGroup value={currentUser?.email ?? ''} className="gap-2 space-y-1">
            <DropdownMenuLabel>
              Sua Conta
            </DropdownMenuLabel>

            <DropdownMenuRadioItem
              value={currentUser?.email ?? ''}
              className="data-[state=checked]:bg-secondary cursor-pointer"
            >
              <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-2">
                <div className="relative">
                  <Avatar
                    name={currentUser?.name ?? 'User'}
                    src={currentUser?.avatar_url ? `${API_URL}${currentUser.avatar_url}` : undefined}
                    size="36px"
                    round={true}
                  />
                  <div className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500
                    dark:bg-emerald-400 ring-sidebar ring-1"></div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold truncate">
                    {currentUser?.name ?? 'Carregando…'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {currentUser?.email ?? ''}
                  </p>
                </div>
              </div>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>



        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
