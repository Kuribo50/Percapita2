'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
}

interface SubMenuItem {
  title: string;
  href: string;
}

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  submenu?: SubMenuItem[];
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['ingreso']); // Abrir primer menú por defecto

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuTitle)
        ? prev.filter((item) => item !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Ingreso/Cambio de Estado',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      submenu: [
        { title: 'Nuevos Usuarios', href: '/dashboard/nuevos-usuarios' },
        { title: 'Traslado de Usuarios', href: '/dashboard/traslado-usuarios' },
      ],
    },
    {
      title: 'Subir',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      submenu: [
        { title: 'Subir Corte', href: '/dashboard/subir-corte' },
      ],
    },
    {
      title: 'Bases de Datos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h10" />
        </svg>
      ),
      submenu: [
        { title: 'Gestión Corte & HP', href: '/dashboard/bases' },
      ],
    },
    {
      title: 'Revisión',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      submenu: [
        { title: 'Revisión de Usuarios Inscritos', href: '/dashboard/revision-usuarios' },
        { title: 'Rechazos', href: '/dashboard/rechazos' },
        { title: 'Traslados', href: '/dashboard/traslados' },
        { title: 'Migrantes', href: '/dashboard/migrantes' },
        { title: 'Renovación de NIP', href: '/dashboard/renovacion-nip' },
        { title: 'Revisión Diaria', href: '/dashboard/revision-diaria' },
      ],
    },
    {
      title: 'Generar Certificados',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      submenu: [
        { title: 'Certificado de Inscripción', href: '/dashboard/certificado-inscripcion' },
        { title: 'Certificado de Renuncia', href: '/dashboard/certificado-renuncia' },
        { title: 'Certificado de Residencia', href: '/dashboard/certificado-residencia' },
      ],
    },
    {
      title: 'Configuración',
      href: '/dashboard/configuracion',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen pt-16 transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 w-64 lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.title}>
                {item.submenu ? (
                  // Menu con submenu
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title.toLowerCase().replace(/\s+/g, '-'))}
                      className="flex items-center justify-between w-full p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-500 group-hover:text-blue-600">
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          openMenus.includes(item.title.toLowerCase().replace(/\s+/g, '-'))
                            ? 'rotate-180'
                            : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Submenu */}
                    {openMenus.includes(item.title.toLowerCase().replace(/\s+/g, '-')) && (
                      <ul className="mt-2 space-y-1 pl-11">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={`block p-2 text-sm rounded-lg transition-colors ${
                                pathname === subItem.href
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  // Menu sin submenu
                  <Link
                    href={item.href || '#'}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors group ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={pathname === item.href ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
