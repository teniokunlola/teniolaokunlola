import React, { type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, Moon, Sun, Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useUIStore, useThemeSync } from '@/store';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
	children: ReactNode;
	title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Admin" }) => {
	useThemeSync();
	const { user, isAdmin, isSuperAdmin } = useAuth();
	const theme = useUIStore(state => state.theme);
	const toggleTheme = useUIStore(state => state.toggleTheme);
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const sidebarWidthClass = collapsed ? 'lg:ml-16' : 'lg:ml-64';

	return (
		<div className={`min-h-screen flex bg-background text-foreground admin-theme`} data-theme={theme}>
			{/* Desktop Sidebar */}
			<div className={`hidden lg:block fixed inset-y-0 left-0 z-40 ${collapsed ? 'w-16' : 'w-64'} admin-sidebar`}>
				<div className="h-full overflow-y-auto admin-scrollbar">
					<AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
				</div>
			</div>

			{/* Mobile Sidebar (off-canvas) */}
			{mobileOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
					<div className="absolute inset-y-0 left-0 w-64 bg-background border-r border-border shadow-xl">
						<AdminSidebar collapsed={false} setCollapsed={() => {}} mobileClose={() => setMobileOpen(false)} />
					</div>
				</div>
			)}

			{/* Main Content Area */}
			<div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarWidthClass}`}>
				{/* Fixed Header */}
				<header className="bg-background border-border shadow-sm border-b fixed top-0 z-30 w-full">
					<div className="px-4 sm:px-6 py-3 sm:py-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-3 sm:gap-4">
								{/* Mobile menu toggle */}
								<button
									className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border"
									onClick={() => setMobileOpen(true)}
									aria-label="Open sidebar"
								>
									<Menu className="h-5 w-5" />
								</button>
								<div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
									<Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
								</div>
								<h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
							</div>
							<div className="flex items-center space-x-2 sm:space-x-4">
								{/* Theme Toggle */}
								<Button
									variant="ghost"
									size="sm"
									onClick={toggleTheme}
									className="p-2 hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500/30 hover:shadow-purple-500/10 hover:cursor-pointer transition-colors"
								>
									{theme === 'dark' ? (
										<Sun className="h-5 w-5" />
									) : (
										<Moon className="h-5 w-5" />
									)}
								</Button>

								{/* User Info */}
								<div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
									<div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg">
										<User className="h-4 w-4 text-purple-500" />
									</div>
									<span className="hidden sm:inline">{user?.email}</span>
									{isAdmin && (
										<Badge 
											variant="secondary" 
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
												isSuperAdmin 
													? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-500 border-purple-500/30' 
													: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-500 border-blue-500/30'
											}`}
										>
											{isSuperAdmin ? 'Super Admin' : 'Admin'}
										</Badge>
									)}
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className={`flex-1 p-4 sm:p-6 overflow-auto pt-20 sm:pt-24 admin-scrollbar`}>
					<div className="max-w-7xl mx-auto">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
