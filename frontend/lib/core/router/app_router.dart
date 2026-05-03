import 'package:go_router/go_router.dart';
import 'package:baker_go/features/auth/screens/onboarding_screen.dart';
import 'package:baker_go/features/auth/screens/auth_selector_screen.dart';
import 'package:baker_go/features/auth/screens/sign_in_screen.dart';
import 'package:baker_go/features/auth/screens/sign_up_screen.dart';
import 'package:baker_go/features/auth/screens/welcome_screen.dart';
import 'package:baker_go/features/home/screens/home_screen.dart';
import 'package:baker_go/features/profile/screens/profile_screen.dart';
import 'package:baker_go/features/profile/screens/profile_edit_screen.dart';
import 'package:baker_go/features/profile/screens/change_password_screen.dart';
import 'package:baker_go/features/master_bahan/screens/master_bahan_screen.dart';
import 'package:baker_go/features/master_resep/screens/master_resep_screen.dart';
import 'package:baker_go/features/hpp/screens/hpp_screen.dart';
import 'package:baker_go/features/pengeluaran/screens/pengeluaran_screen.dart';
import 'package:baker_go/features/penjualan/screens/penjualan_screen.dart';
import 'package:baker_go/features/laporan/screens/laporan_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (ctx, state) => const OnboardingScreen()),
    GoRoute(path: '/auth', builder: (ctx, state) => const AuthSelectorScreen()),
    GoRoute(path: '/login', builder: (ctx, state) => const SignInScreen()),
    GoRoute(path: '/register', builder: (ctx, state) => const SignUpScreen()),
    GoRoute(path: '/welcome', builder: (ctx, state) => const WelcomeScreen()),
    GoRoute(path: '/home', builder: (ctx, state) => const HomeScreen()),
    GoRoute(path: '/profile', builder: (ctx, state) => const ProfileScreen()),
    GoRoute(path: '/profile/edit', builder: (ctx, state) => const ProfileEditScreen()),
    GoRoute(path: '/profile/password', builder: (ctx, state) => const ChangePasswordScreen()),
    GoRoute(path: '/master-bahan', builder: (ctx, state) => const MasterBahanScreen()),
    GoRoute(path: '/master-resep', builder: (ctx, state) => const MasterResepScreen()),
    GoRoute(path: '/hpp', builder: (ctx, state) => const HppScreen()),
    GoRoute(path: '/pengeluaran', builder: (ctx, state) => const PengeluaranScreen()),
    GoRoute(path: '/penjualan', builder: (ctx, state) => const PenjualanScreen()),
    GoRoute(path: '/laporan', builder: (ctx, state) => const LaporanScreen()),
  ],
);
