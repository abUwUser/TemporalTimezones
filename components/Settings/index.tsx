import UserManager from "../../handlers/user";
import * as webpack from "ittai/webpack";
const {
    React, React: {
        useReducer
    },
    ModalActions
} = webpack
import { Avatar, Button, SwitchItem, Category, DiscordIcon } from "ittai/components";
import { Users } from "ittai/stores";
import AddUserModal from "./AddUserModal";
import styles from "./index.scss"
import { UserID, UserObject } from "ittai";
import { useTemporalUpdate } from "../../hooks/useTemporalUpdate";
import * as Temporal from "temporal-polyfill"
import * as settings from "ittai/settings"


export default () => {
    console.log(settings.get("seconds"))
    const [, forceUpdate] = useReducer(n => n + 1, 0);
    
    return <>
        <Category 
            title={<CategoryIconTitle icon="PersonAdd">Local User List</CategoryIconTitle>}
            description="Manually set which timezones you want to apply for your friends"
        >
            <div className={styles["user-list"]}>
                {Object.entries(UserManager.getAll()).map(
                    ([id, userSettings]) => <UserItem id={id} userSettings={userSettings} onDelete={() => {
                        UserManager.remove(id)
                        forceUpdate()
                    }} />
                )}

                <Button
                    className={styles["add-user-button"]}
                    onClick={() => ModalActions.openModal(
                        (h: Object) => <AddUserModal modalRootProps={h} onChooseUser={(user, timezone) => {
                            UserManager.add(user.id, { timeZone: timezone })
                            forceUpdate()
                        }} />
                    )}
                >Add a new user</Button>
            </div>
        </Category>

        <Category title={<CategoryIconTitle icon="HourglassCircle">Timer Display</CategoryIconTitle>} description="Customize how you want to display the current time">
            {console.log(settings.get("seconds", false))}
            <SwitchItem
                value={settings.get("seconds", false)}
                onChange={() => {
                    console.log(settings.get("seconds", false))
                    settings.set("seconds", !settings.get("seconds", false))
                }}
            >Enable seconds</SwitchItem>
        </Category>
    </>
}



interface UserItemProps {
    id: UserID,
    userSettings: SettingsUserObject
    onDelete: () => void
}
const UserItem = ({ id, userSettings, onDelete }: UserItemProps) => {
    const time = useTemporalUpdate(() => Temporal.Now.instant().toZonedDateTimeISO(userSettings.timeZone))
    
    const discordUser: UserObject = Users.getUser(id)

    return <div className={styles["item"]}>
        <Avatar src={discordUser.getAvatarURL(false, true)} size={Avatar.Sizes.SIZE_20} />
        <span className={styles["username"]}>{discordUser?.username}</span>
        <span className={styles["current-time"]}>
            {time.toPlainTime().toString({ smallestUnit: settings.get("seconds", false) ? 'second' : 'minute' })}
        </span>
        <a onClick={onDelete}>delete</a>
    </div>
}

const CategoryIconTitle = ({ children, icon }: { children: React.ReactNode, icon: string }) => {
    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <span style={{ marginRight: "6px" }}>{children}</span>
        <DiscordIcon name={icon} width="16" height="16" />
    </div>
}