import 'server-only'
import { ActionLogRoleEnum } from '@chasterapp/chaster-js'
import { PartnerUserRoleEnum } from '@chasterapp/chaster-js/dist/api'

export function mapUserRoleToLogRole(
  userRole: PartnerUserRoleEnum,
): ActionLogRoleEnum {
  switch (userRole) {
    case PartnerUserRoleEnum.Wearer:
      return ActionLogRoleEnum.User
    case PartnerUserRoleEnum.Keyholder:
      return ActionLogRoleEnum.Keyholder
  }
}
