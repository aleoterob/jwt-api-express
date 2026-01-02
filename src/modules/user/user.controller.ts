import { Request, Response } from 'express';
import { UserService } from './user.service';

const userService = new UserService();

export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'ID es requerido' });
      return;
    }

    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

export const getUserByEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;

    if (!email) {
      res.status(400).json({ error: 'Email es requerido' });
      return;
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await userService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profileData = req.body as {
      id: string;
      email: string;
      [key: string]: unknown;
    };

    if (!profileData.id || !profileData.email) {
      res.status(400).json({ error: 'ID y email son requeridos' });
      return;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileData.id)) {
      res.status(400).json({ error: 'ID debe ser un UUID válido' });
      return;
    }

    const user = await userService.createUser(profileData);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error al crear usuario:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('foreign key') ||
        error.message.includes('violates foreign key') ||
        error.message.includes('debe existir primero en auth.users')
      ) {
        res.status(400).json({
          error:
            'El usuario debe existir primero en auth.users antes de crear el perfil',
          details: error.message,
        });
        return;
      }

      if (
        error.message.includes('duplicate key') ||
        error.message.includes('unique constraint') ||
        error.message.includes('ya existe')
      ) {
        res.status(409).json({
          error: 'El perfil ya existe para este usuario',
          details: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Error al crear el usuario',
        details: error.message,
      });
      return;
    }

    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

export const createUserWithProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, full_name, role, bio, avatar_url } = req.body as {
      email: string;
      password: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const userData: {
      email: string;
      password: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    } = {
      email,
      password,
    };

    if (full_name !== undefined) userData.full_name = full_name;
    if (role !== undefined) userData.role = role;
    if (bio !== undefined) userData.bio = bio;
    if (avatar_url !== undefined) userData.avatar_url = avatar_url;

    const result = await userService.createUserWithProfile(userData);

    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        created_at: result.user.created_at,
      },
      profile: result.profile,
    });
  } catch (error) {
    console.error('Error al crear usuario con perfil:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('duplicate key') ||
        error.message.includes('unique constraint') ||
        error.message.includes('ya existe')
      ) {
        res.status(409).json({
          error: 'El usuario ya existe',
          details: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Error al crear el usuario',
        details: error.message,
      });
      return;
    }

    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { email, password, full_name, role, bio, avatar_url } = req.body as {
      email?: string;
      password?: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    };

    if (!id) {
      res.status(400).json({ error: 'ID es requerido' });
      return;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'ID debe ser un UUID válido' });
      return;
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Email inválido' });
        return;
      }
    }

    if (password !== undefined && password.length < 6) {
      res
        .status(400)
        .json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const updateData: {
      email?: string;
      password?: string;
      full_name?: string;
      role?: string;
      bio?: string;
      avatar_url?: string;
    } = {};

    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const result = await userService.updateUserWithProfile(id, updateData);

    res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        updated_at: result.user.updated_at,
      },
      profile: result.profile,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    if (error instanceof Error) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          error: 'Usuario no encontrado',
          details: error.message,
        });
        return;
      }

      if (
        error.message.includes('duplicate key') ||
        error.message.includes('unique constraint')
      ) {
        res.status(409).json({
          error: 'El email ya está en uso',
          details: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Error al actualizar el usuario',
        details: error.message,
      });
      return;
    }

    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'ID es requerido' });
      return;
    }

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
