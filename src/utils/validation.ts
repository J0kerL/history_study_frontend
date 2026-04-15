import { z } from 'zod'
import {
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  PHONE_LENGTH,
} from '../constants'

/** 登录表单校验规则 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, '请输入用户名')
    .max(MAX_USERNAME_LENGTH, `用户名不能超过 ${MAX_USERNAME_LENGTH} 个字符`),
  password: z
    .string()
    .min(1, '请输入密码'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/** 注册表单校验规则 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, '请输入用户名')
      .max(MAX_USERNAME_LENGTH, `用户名不能超过 ${MAX_USERNAME_LENGTH} 个字符`),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `密码长度至少 ${MIN_PASSWORD_LENGTH} 个字符`)
      .max(MAX_PASSWORD_LENGTH, `密码长度不能超过 ${MAX_PASSWORD_LENGTH} 个字符`),
    confirmPassword: z
      .string()
      .min(1, '请确认密码'),
    phone: z
      .string()
      .regex(/^\d{11}$/, `请输入正确的 ${PHONE_LENGTH} 位手机号`),
    verificationCode: z
      .string()
      .min(1, '请输入验证码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

/** 修改密码表单校验规则 */
export const updatePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, '请输入原密码'),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `密码长度至少 ${MIN_PASSWORD_LENGTH} 个字符`)
      .max(MAX_PASSWORD_LENGTH, `密码长度不能超过 ${MAX_PASSWORD_LENGTH} 个字符`),
    confirmNewPassword: z
      .string()
      .min(1, '请确认新密码'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: '两次输入的新密码不一致',
    path: ['confirmNewPassword'],
  })

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
